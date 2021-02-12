interface SheetConfig {
  [type: string]: {
    destinations: { kind: string; columnRange: string; columnNames: string[] }[]
  }
}

export const sheetConfig: SheetConfig = {
  pcr: {
    destinations: [
      {
        kind: 'patient',
        columnRange: 'B-V,X-AD,AK-AN,AR-AT',
        columnNames: [
          'nama',
          'jns_identitas',
          'nik',
          'tgl_lahir',
          'usia_thn',
          'usia_bln',
          'jkel',
          'telp',
          'alamat_domisili',
          'alamat_propkd',
          'alamat_propnm',
          'alamat_kabkd',
          'alamat_kabnm',
          'alamat_keckd',
          'alamat_kecnm',
          'alamat_kelkd',
          'alamat_kelnm',
          'alamat_rw',
          'alamat_rt',
          'warganegara',
          'warganegara_ket',
          'tgl_gejala',
          'faskes_jns',
          'faskes_nm',
          'faskes_propkd',
          'faskes_propnm',
          'faskes_kabkd',
          'faskes_kabnm',
          'created_by',
          'created_date',
          'lab_kd',
          'lab_nm',
          'hsl_lab',
          'verif_by',
          'verif_date',
        ],
      },
      {
        kind: 'specimen',
        columnRange: 'B-AT',
        columnNames: [
          'nama',
          'jns_identitas',
          'nik',
          'tgl_lahir',
          'usia_thn',
          'usia_bln',
          'jkel',
          'telp',
          'alamat_domisili',
          'alamat_propkd',
          'alamat_propnm',
          'alamat_kabkd',
          'alamat_kabnm',
          'alamat_keckd',
          'alamat_kecnm',
          'alamat_kelkd',
          'alamat_kelnm',
          'alamat_rw',
          'alamat_rt',
          'warganegara',
          'warganegara_ket',
          'tujuan_periksa',
          'tgl_gejala',
          'faskes_jns',
          'faskes_nm',
          'faskes_propkd',
          'faskes_propnm',
          'faskes_kabkd',
          'faskes_kabnm',
          'pembiayaan',
          'no_lab',
          'no_pemeriksaan',
          'jns_spesimen',
          'tgl_pengambilan',
          'tgl_kirim',
          'created_by',
          'created_date',
          'kd_lab',
          'nm_lab',
          'tgl_terima',
          'tgl_periksa',
          'tgl_hasil',
          'hsl_lab',
          'verif_by',
          'verif_date',
        ],
      },
    ],
  },
  antigen: {
    destinations: [
      {
        kind: 'patient',
        columnRange: 'B-V,Y-AC,AK-AL',
        columnNames: [
          'nama',
          'jns_identitas',
          'nik',
          'tgl_lahir',
          'usia_thn',
          'usia_bln',
          'jkel',
          'telp',
          'alamat_domisili',
          'alamat_propkd',
          'alamat_propnm',
          'alamat_kabkd',
          'alamat_kabnm',
          'alamat_keckd',
          'alamat_kecnm',
          'alamat_kelkd',
          'alamat_kelnm',
          'alamat_rw',
          'alamat_rt',
          'warganegara',
          'warganegara_ket',
          'faskes_nm',
          'faskes_propkd',
          'faskes_propnm',
          'faskes_kabkd',
          'faskes_kabnm',
          'hsl_lab',
          'created_date',
        ],
      },
      {
        kind: 'specimen',
        columnRange: 'C-AL',
        columnNames: [
          'jns_identitas',
          'nik',
          'tgl_lahir',
          'usia_thn',
          'usia_bln',
          'jkel',
          'telp',
          'alamat_domisili',
          'alamat_propkd',
          'alamat_propnm',
          'alamat_kabkd',
          'alamat_kabnm',
          'alamat_keckd',
          'alamat_kecnm',
          'alamat_kelkd',
          'alamat_kelnm',
          'alamat_rw',
          'alamat_rt',
          'warganegara',
          'warganegara_ket',
          'tujuan_periksa',
          'faskes_jns',
          'faskes_nm',
          'faskes_propkd',
          'faskes_propnm',
          'faskes_kabkd',
          'faskes_kabnm',
          'pembiayaan',
          'tgl_gejala',
          'no_spesimen',
          'no_pemeriksaan',
          'jns_spesimen',
          'tgl_pengambilan',
          'tgl_hasil',
          'hsl_lab',
          'created_date',
        ],
      },
    ],
  },
}
