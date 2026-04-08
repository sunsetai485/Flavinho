import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, unauthorized } from '@/lib/auth';
import { parseNumber, formatDate, brDateToISO, classifyCategory, generateBatchId } from '@/lib/utils';

export async function POST(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth) return unauthorized();

  try {
    const body = await request.json();
    const { realData, projectionData, filename, fileType } = body;

    const batchId = generateBatchId();
    let recordsImported = 0;
    let projectionsImported = 0;

    if (realData && realData.length > 0) {
      const parsed = parseRealData(realData);
      if (parsed.length > 0) {
        const records = parsed.map((t) => ({
          user_id: auth.user.id,
          date: brDateToISO(t.date),
          description: t.description,
          category_name: t.category_name,
          credit: t.credit,
          debit: t.debit,
          balance: t.balance,
          import_batch: batchId,
        }));

        const CHUNK = 500;
        for (let i = 0; i < records.length; i += CHUNK) {
          const chunk = records.slice(i, i + CHUNK);
          const { error } = await auth.supabase.from('transactions').insert(chunk);
          if (error) throw new Error(`Insert error: ${error.message}`);
        }
        recordsImported = records.length;
      }
    }

    if (projectionData && projectionData.length > 0) {
      const parsed = parseProjectionData(projectionData);
      if (parsed.length > 0) {
        const records = parsed.map((p) => ({
          user_id: auth.user.id,
          date: brDateToISO(p.date),
          year: p.year,
          month: p.month,
          type: p.type,
          category: p.category,
          description: p.description,
          amount: p.amount,
          projected_balance: p.projected_balance,
          import_batch: batchId,
        }));

        const CHUNK = 500;
        for (let i = 0; i < records.length; i += CHUNK) {
          const chunk = records.slice(i, i + CHUNK);
          const { error } = await auth.supabase.from('projected_transactions').insert(chunk);
          if (error) throw new Error(`Projection insert error: ${error.message}`);
        }
        projectionsImported = records.length;
      }
    }

    await auth.supabase.from('import_history').insert({
      user_id: auth.user.id,
      filename: filename || 'unknown',
      file_type: fileType || 'unknown',
      records_imported: recordsImported,
      projections_imported: projectionsImported,
      batch_id: batchId,
    });

    return NextResponse.json({
      success: true,
      batchId,
      recordsImported,
      projectionsImported,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function parseRealData(rows: unknown[][]): {
  date: string;
  description: string;
  credit: number;
  debit: number;
  balance: number;
  category_name: string;
}[] {
  let idxDate = -1, idxDesc = -1, idxCredit = -1, idxDebit = -1, idxBalance = -1;
  let dataStarted = false;
  let dataRows = [...rows];

  for (let i = 0; i < Math.min(dataRows.length, 30); i++) {
    const row = dataRows[i];
    if (!row || !Array.isArray(row)) continue;
    for (let c = 0; c < row.length; c++) {
      const val = String(row[c] || '').trim().toUpperCase();
      if (val === 'DATA' || val.includes('DATA ')) idxDate = c;
      else if (val.includes('DESCRI') || val.includes('LANÇA')) idxDesc = c;
      else if (val.includes('CRÉDITO') || val.includes('CREDITO')) idxCredit = c;
      else if (val.includes('DÉBITO') || val.includes('DEBITO')) idxDebit = c;
      else if (val.includes('SALDO')) idxBalance = c;
    }
    if (idxDate !== -1 && idxDesc !== -1 && (idxDebit !== -1 || idxCredit !== -1)) {
      dataRows = dataRows.slice(i + 1);
      dataStarted = true;
      break;
    }
  }

  if (!dataStarted) {
    idxDate = 0; idxDesc = 1; idxCredit = 4; idxDebit = 5; idxBalance = 6;
  }

  const result: ReturnType<typeof parseRealData> = [];

  for (const row of dataRows) {
    if (!row || !Array.isArray(row) || row.length === 0) continue;
    const rawDate = formatDate(row[idxDate]);
    if (!rawDate || !rawDate.includes('/')) continue;

    const description = String(row[idxDesc] || 'Sem descrição').trim();
    const credit = Math.abs(parseNumber(row[idxCredit]));
    const debit = Math.abs(parseNumber(row[idxDebit]));
    const balance = parseNumber(row[idxBalance]);

    if (credit === 0 && debit === 0) continue;

    const category_name = debit > 0 ? classifyCategory(description) : 'Entrada/Rendimento';

    result.push({ date: rawDate, description, credit, debit, balance, category_name });
  }

  return result;
}

function parseProjectionData(rows: unknown[][]): {
  date: string;
  year: number;
  month: string;
  type: 'receita' | 'despesa';
  category: string;
  description: string;
  amount: number;
  projected_balance: number;
}[] {
  const monthConverter: Record<string, string> = {
    jan: '01', fev: '02', mar: '03', abr: '04', mai: '05', jun: '06',
    jul: '07', ago: '08', set: '09', out: '10', nov: '11', dez: '12',
    janeiro: '01', fevereiro: '02', março: '03', marco: '03', maio: '05',
    junho: '06', julho: '07', agosto: '08', setembro: '09', outubro: '10',
    novembro: '11', dezembro: '12',
  };

  const result: ReturnType<typeof parseProjectionData> = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || !Array.isArray(row) || row.length === 0) continue;

    const dataRaw = row[0];
    let dateFormatted = formatDate(dataRaw);
    const year = String(row[1] || '').trim();
    const month = String(row[2] || '').trim();
    const type = String(row[4] || '').trim().toLowerCase();
    const category = String(row[5] || '').trim();
    const description = String(row[7] || '').trim();
    const amount = parseNumber(row[8]);
    const balance = parseNumber(row[9]);

    if (!year || !month || !type || !description || amount === 0) continue;
    if (type !== 'receita' && type !== 'despesa') continue;

    if (!dateFormatted || dateFormatted === 'null') {
      const numMonth = monthConverter[month.toLowerCase()] || '01';
      dateFormatted = `01/${numMonth}/${year}`;
    }

    result.push({
      date: dateFormatted,
      year: parseInt(year),
      month,
      type: type as 'receita' | 'despesa',
      category,
      description,
      amount,
      projected_balance: balance,
    });
  }

  return result;
}
