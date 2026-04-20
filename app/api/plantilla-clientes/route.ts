import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export async function GET() {
  try {
    const workbook = XLSX.utils.book_new()
    const datos = [
      {
        'Nombre': 'Ejemplo Cliente 1',
        'Código Cliente': 'CLI001',
        'RFC': 'ABC123456XYZ',
        'Teléfono': '5551234567',
        'Email': 'cliente@example.com',
        'Dirección': 'Calle Principal 123',
        'Ciudad': 'México',
        'Estado': 'CDMX',
        'Código Postal': '06500',
        'Saldo': '0.00',
        'Límite Crédito': '10000.00',
        'Notas': 'Notas del cliente'
      }
    ]
    const worksheet = XLSX.utils.json_to_sheet(datos)
    const columnWidths = [
      { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 30 },
      { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 30 }
    ]
    worksheet['!cols'] = columnWidths
    worksheet['!autofilter'] = { ref: 'A1:L1' }
    
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + '1'
      if (!worksheet[address]) continue
      worksheet[address].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '366092' } },
        alignment: { horizontal: 'center', vertical: 'center' }
      }
    }
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Clientes')
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' })
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="plantilla-clientes.xlsx"'
      }
    })
  } catch (err: any) {
    console.error('Error al generar plantilla:', err)
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}
