import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export async function GET() {
  try {
    const workbook = XLSX.utils.book_new()
    const datos = [
      {
        'Nombre': 'Ejemplo Producto 1',
        'Código': 'PROD001',
        'Descripción': 'Descripción del producto',
        'Precio': '100.00',
        'Costo': '50.00',
        'Stock': '10',
        'Marca': 'Marca Ejemplo',
        'Categoría': 'Categoría Ejemplo'
      }
    ]
    const worksheet = XLSX.utils.json_to_sheet(datos)
    const columnWidths = [
      { wch: 25 }, { wch: 15 }, { wch: 30 }, { wch: 12 }, { wch: 12 }, { wch: 10 },
      { wch: 20 }, { wch: 20 }
    ]
    worksheet['!cols'] = columnWidths
    worksheet['!autofilter'] = { ref: 'A1:H1' }
    
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
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Productos')
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' })
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="plantilla-productos.xlsx"'
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
