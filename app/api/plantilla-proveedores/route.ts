import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export async function GET() {
  try {
    // Crear un nuevo workbook
    const workbook = XLSX.utils.book_new()

    // Datos de ejemplo con encabezados
    const datos = [
      {
        'Nombre': 'Ejemplo Proveedor 1',
        'RFC': 'ABC123456XYZ',
        'Email': 'proveedor1@example.com',
        'Teléfono': '5551234567',
        'Dirección': 'Calle Principal 123',
        'Ciudad': 'México',
        'Estado': 'CDMX',
        'Código Postal': '06500',
        'País': 'México',
        'Contacto': 'Juan Pérez',
        'Condiciones de Pago': 'Neto 30',
        'Activo': 'Sí'
      }
    ]

    // Crear worksheet
    const worksheet = XLSX.utils.json_to_sheet(datos)

    // Configurar ancho de columnas
    const columnWidths = [
      { wch: 25 }, // Nombre
      { wch: 15 }, // RFC
      { wch: 25 }, // Email
      { wch: 15 }, // Teléfono
      { wch: 30 }, // Dirección
      { wch: 15 }, // Ciudad
      { wch: 15 }, // Estado
      { wch: 15 }, // Código Postal
      { wch: 15 }, // País
      { wch: 20 }, // Contacto
      { wch: 20 }, // Condiciones de Pago
      { wch: 10 }  // Activo
    ]
    worksheet['!cols'] = columnWidths

    // Agregar filtros automáticos
    worksheet['!autofilter'] = { ref: 'A1:L1' }

    // Formatear encabezados (negrita)
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

    // Agregar worksheet al workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Proveedores')

    // Generar buffer
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' })

    // Retornar archivo
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="plantilla-proveedores.xlsx"'
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
