export interface SheetConfig {
  [type: string]: {
    source: {
      columns: { col: string; title: string }[]
    }
    destinations: {
      kind: string
      columns: {
        inSheet: { col: string; name: string; type?: string }[]
        outSheet: { name: string; type?: string }[]
      }
    }[]
  }
}

// TODO: Remove hardcode
export const sheetConfig: SheetConfig = {
  pcr: {
    source: {
      columns: [
        { col: 'A', title: 'NO' },
        { col: 'B', title: 'NAMA' },
        { col: 'C', title: 'JNS IDENTITAS' },
        { col: 'D', title: 'NO IDENTITAS' },
        { col: 'E', title: 'TGL LAHIR' },
        { col: 'F', title: 'USIA (THN)' },
        { col: 'G', title: 'USIA (BLN)' },
        { col: 'H', title: 'JNS KELAMIN' },
        { col: 'I', title: 'NO HP' },
        { col: 'J', title: 'ALAMAT' },
        { col: 'K', title: 'ALAMAT KODE PROPINSI' },
        { col: 'L', title: 'ALAMAT PROPINSI' },
        { col: 'M', title: 'ALAMAT KODE KAB/KOTA' },
        { col: 'N', title: 'ALAMAT KAB/KOTA' },
        { col: 'O', title: 'ALAMAT KODE KECAMATAN' },
        { col: 'P', title: 'ALAMAT KECAMATAN' },
        { col: 'Q', title: 'ALAMAT KODE KELURAHAN' },
        { col: 'R', title: 'ALAMAT KELURAHAN' },
        { col: 'S', title: 'ALAMAT RW' },
        { col: 'T', title: 'ALAMAT RT' },
        { col: 'U', title: 'WARGANEGARA' },
        { col: 'V', title: 'WARGANEGARA_KET' },
        { col: 'W', title: 'TUJUAN PEMERIKSAAN' },
        { col: 'X', title: 'TGL GEJALA' },
        { col: 'Y', title: 'JENIS FASKES' },
        { col: 'Z', title: 'NAMA FASKES' },
        { col: 'AA', title: 'KODE PROPINSI FASKES' },
        { col: 'AB', title: 'PROPINSI FASKES' },
        { col: 'AC', title: 'KODE KAB/KOTA FASKES' },
        { col: 'AD', title: 'KAB/KOTA FASKES' },
        { col: 'AE', title: 'PEMBIAYAAN' },
        { col: 'AF', title: 'NO SPESIMEN' },
        { col: 'AG', title: 'PENGAMBILAN SPESIMEN KE' },
        { col: 'AH', title: 'JENIS SPESIMEN' },
        { col: 'AI', title: 'TGL PENGAMBILAN SPESIMEN' },
        { col: 'AJ', title: 'TGL PENGIRIMAN SPESIMEN' },
        { col: 'AK', title: 'PELAPOR SPESIMEN' },
        { col: 'AL', title: 'TGL ENTRY LAPOR' },
        { col: 'AM', title: 'KODE LABORATORIUM' },
        { col: 'AN', title: 'NAMA LABORATORIUM' },
        { col: 'AO', title: 'TGL TERIMA SPESIMEN' },
        { col: 'AP', title: 'TGL PERIKSA SPESIMEN' },
        { col: 'AQ', title: 'TGL HASIL KELUAR' },
        { col: 'AR', title: 'HASIL PEMERIKSAAN' },
        { col: 'AS', title: 'LAB YANG MELAKUKAN VERIF' },
        { col: 'AT', title: 'TGL VERIF' },
      ],
    },
    destinations: [
      {
        kind: 'patient',
        columns: {
          inSheet: [
            { col: 'B', name: 'nama' },
            { col: 'C', name: 'jns_identitas' },
            { col: 'D', name: 'nik' },
            { col: 'E', name: 'tgl_lahir' },
            { col: 'F', name: 'usia_thn' },
            { col: 'G', name: 'usia_bln' },
            { col: 'H', name: 'jkel' },
            { col: 'I', name: 'telp' },
            { col: 'J', name: 'alamat_domisili' },
            { col: 'K', name: 'alamat_propkd' },
            { col: 'L', name: 'alamat_propnm' },
            { col: 'M', name: 'alamat_kabkd' },
            { col: 'N', name: 'alamat_kabnm' },
            { col: 'O', name: 'alamat_keckd' },
            { col: 'P', name: 'alamat_kecnm' },
            { col: 'Q', name: 'alamat_kelkd' },
            { col: 'R', name: 'alamat_kelnm' },
            { col: 'S', name: 'alamat_rw' },
            { col: 'T', name: 'alamat_rt' },
            { col: 'U', name: 'warganegara' },
            { col: 'V', name: 'warganegara_ket' },
            { col: 'X', name: 'tgl_gejala' },
            { col: 'Y', name: 'faskes_jns' },
            { col: 'Z', name: 'faskes_nm' },
            { col: 'AA', name: 'faskes_propkd' },
            { col: 'AB', name: 'faskes_propnm' },
            { col: 'AC', name: 'faskes_kabkd' },
            { col: 'AD', name: 'faskes_kabnm' },
            { col: 'AK', name: 'created_by' },
            { col: 'AL', name: 'created_date' },
            { col: 'AM', name: 'lab_kd' },
            { col: 'AN', name: 'lab_nm' },
            { col: 'AR', name: 'hsl_lab' },
            { col: 'AS', name: 'verif_by' },
            { col: 'AT', name: 'verif_date' },
          ],
          outSheet: [
            { name: 'alamat' },
            { name: 'faskes_kd' },
            { name: 'faskes_ket' },
            { name: 'created_id' },
            { name: 'modified_id' },
            { name: 'modified_by' },
            { name: 'modified_date' },
            { name: 'verif_id' },
            { name: 'bantu_dump_nar' },
          ],
        },
      },
      {
        kind: 'specimen',
        columns: {
          inSheet: [
            { col: 'B', name: 'nama' },
            { col: 'C', name: 'jns_identitas' },
            { col: 'D', name: 'nik' },
            { col: 'E', name: 'tgl_lahir' },
            { col: 'F', name: 'usia_thn' },
            { col: 'G', name: 'usia_bln' },
            { col: 'H', name: 'jkel' },
            { col: 'I', name: 'telp' },
            { col: 'J', name: 'alamat_domisili' },
            { col: 'K', name: 'alamat_propkd' },
            { col: 'L', name: 'alamat_propnm' },
            { col: 'M', name: 'alamat_kabkd' },
            { col: 'N', name: 'alamat_kabnm' },
            { col: 'O', name: 'alamat_keckd' },
            { col: 'P', name: 'alamat_kecnm' },
            { col: 'Q', name: 'alamat_kelkd' },
            { col: 'R', name: 'alamat_kelnm' },
            { col: 'S', name: 'alamat_rw' },
            { col: 'T', name: 'alamat_rt' },
            { col: 'U', name: 'warganegara' },
            { col: 'V', name: 'warganegara_ket' },
            { col: 'W', name: 'tujuan_periksa' },
            { col: 'X', name: 'tgl_gejala' },
            { col: 'Y', name: 'faskes_jns' },
            { col: 'Z', name: 'faskes_nm' },
            { col: 'AA', name: 'faskes_propkd' },
            { col: 'AB', name: 'faskes_propnm' },
            { col: 'AC', name: 'faskes_kabkd' },
            { col: 'AD', name: 'faskes_kabnm' },
            { col: 'AE', name: 'pembiayaan' },
            { col: 'AF', name: 'no_lab' },
            { col: 'AG', name: 'no_pemeriksaan' },
            { col: 'AH', name: 'jns_spesimen' },
            { col: 'AI', name: 'tgl_pengambilan' },
            { col: 'AJ', name: 'tgl_kirim' },
            { col: 'AK', name: 'created_by' },
            { col: 'AL', name: 'created_date' },
            { col: 'AM', name: 'kd_lab' },
            { col: 'AN', name: 'nm_lab' },
            { col: 'AO', name: 'tgl_terima' },
            { col: 'AP', name: 'tgl_periksa' },
            { col: 'AQ', name: 'tgl_hasil' },
            { col: 'AR', name: 'hsl_lab' },
            { col: 'AS', name: 'verif_by' },
            { col: 'AT', name: 'verif_date' },
          ],
          outSheet: [
            { name: 'id', type: 'int' },
            { name: 'alamat' },
            { name: 'faskes_kd' },
            { name: 'faskes_ket' },
            { name: 'created_id' },
            { name: 'modified_id' },
            { name: 'modified_date' },
            { name: 'verif_id' },
            { name: 'bantu_dump_nar' },
            { name: 'akun_ehac' },
            { name: 'lab_tujuan_kd' },
            { name: 'lab_tujuan_nm' },
          ],
        },
      },
    ],
  },
  antigen: {
    source: {
      columns: [
        { col: 'A', title: 'NO' },
        { col: 'B', title: 'NAMA' },
        { col: 'C', title: 'JNS IDENTITAS' },
        { col: 'D', title: 'NO IDENTITAS' },
        { col: 'E', title: 'TGL LAHIR' },
        { col: 'F', title: 'USIA (THN)' },
        { col: 'G', title: 'USIA (BLN)' },
        { col: 'H', title: 'JNS KELAMIN' },
        { col: 'I', title: 'NO HP' },
        { col: 'J', title: 'ALAMAT' },
        { col: 'K', title: 'ALAMAT KODE PROPINSI' },
        { col: 'L', title: 'ALAMAT PROPINSI' },
        { col: 'M', title: 'ALAMAT KODE KAB/KOTA' },
        { col: 'N', title: 'ALAMAT KAB/KOTA' },
        { col: 'O', title: 'ALAMAT KODE KECAMATAN' },
        { col: 'P', title: 'ALAMAT KECAMATAN' },
        { col: 'Q', title: 'ALAMAT KODE KELURAHAN' },
        { col: 'R', title: 'ALAMAT KELURAHAN' },
        { col: 'S', title: 'ALAMAT RW' },
        { col: 'T', title: 'ALAMAT RT' },
        { col: 'U', title: 'WARGANEGARA' },
        { col: 'V', title: 'WARGANEGARA_KET' },
        { col: 'W', title: 'TUJUAN PEMERIKSAAN' },
        { col: 'X', title: 'JENIS FASKES' },
        { col: 'Y', title: 'NAMA FASKES' },
        { col: 'Z', title: 'KODE PROPINSI FASKES' },
        { col: 'AA', title: 'PROPINSI FASKES' },
        { col: 'AB', title: 'KODE KAB/KOTA FASKES' },
        { col: 'AC', title: 'KAB/KOTA FASKES' },
        { col: 'AD', title: 'PEMBIAYAAN' },
        { col: 'AE', title: 'TGL GEJALA' },
        { col: 'AF', title: 'NO SPESIMEN' },
        { col: 'AG', title: 'PENGAMBILAN SPESIMEN KE' },
        { col: 'AH', title: 'JENIS SPESIMEN' },
        { col: 'AI', title: 'TGL PENGAMBILAN SPESIMEN' },
        { col: 'AJ', title: 'TGL HASIL KELUAR' },
        { col: 'AK', title: 'HASIL PEMERIKSAAN' },
        { col: 'AL', title: 'TGL ENTRY' },
      ],
    },
    destinations: [
      {
        kind: 'patient',
        columns: {
          inSheet: [
            { col: 'B', name: 'nama' },
            { col: 'C', name: 'jns_identitas', type: 'int' },
            { col: 'D', name: 'nik' },
            { col: 'E', name: 'tgl_lahir' },
            { col: 'F', name: 'usia_thn' },
            { col: 'G', name: 'usia_bln' },
            { col: 'H', name: 'jkel' },
            { col: 'I', name: 'telp' },
            { col: 'J', name: 'alamat_domisili' },
            { col: 'K', name: 'alamat_propkd' },
            { col: 'L', name: 'alamat_propnm' },
            { col: 'M', name: 'alamat_kabkd' },
            { col: 'N', name: 'alamat_kabnm' },
            { col: 'O', name: 'alamat_keckd' },
            { col: 'P', name: 'alamat_kecnm' },
            { col: 'Q', name: 'alamat_kelkd', type: 'int' },
            { col: 'R', name: 'alamat_kelnm' },
            { col: 'S', name: 'alamat_rw' },
            { col: 'T', name: 'alamat_rt' },
            { col: 'U', name: 'warganegara' },
            { col: 'V', name: 'warganegara_ket' },
            { col: 'Y', name: 'faskes_nm' },
            { col: 'Z', name: 'faskes_propkd' },
            { col: 'AA', name: 'faskes_propnm' },
            { col: 'AB', name: 'faskes_kabkd' },
            { col: 'AC', name: 'faskes_kabnm' },
            { col: 'AK', name: 'hsl_lab' },
            { col: 'AL', name: 'created_date' },
          ],
          outSheet: [
            { name: 'alamat_ktp' },
            { name: 'created_id' },
            { name: 'bantu' },
          ],
        },
      },
      {
        kind: 'specimen',
        columns: {
          inSheet: [
            { col: 'B', name: 'nama' },
            { col: 'C', name: 'jns_identitas' },
            { col: 'D', name: 'nik' },
            { col: 'E', name: 'tgl_lahir' },
            { col: 'F', name: 'usia_thn' },
            { col: 'G', name: 'usia_bln' },
            { col: 'H', name: 'jkel' },
            { col: 'I', name: 'telp' },
            { col: 'J', name: 'alamat_domisili' },
            { col: 'K', name: 'alamat_propkd' },
            { col: 'L', name: 'alamat_propnm' },
            { col: 'M', name: 'alamat_kabkd' },
            { col: 'N', name: 'alamat_kabnm' },
            { col: 'O', name: 'alamat_keckd' },
            { col: 'P', name: 'alamat_kecnm' },
            { col: 'Q', name: 'alamat_kelkd' },
            { col: 'R', name: 'alamat_kelnm' },
            { col: 'S', name: 'alamat_rw' },
            { col: 'T', name: 'alamat_rt' },
            { col: 'U', name: 'warganegara' },
            { col: 'V', name: 'warganegara_ket' },
            { col: 'W', name: 'tujuan_periksa' },
            { col: 'X', name: 'faskes_jns' },
            { col: 'Y', name: 'faskes_nm' },
            { col: 'Z', name: 'faskes_propkd' },
            { col: 'AA', name: 'faskes_propnm' },
            { col: 'AB', name: 'faskes_kabkd' },
            { col: 'AC', name: 'faskes_kabnm' },
            { col: 'AD', name: 'pembiayaan' },
            { col: 'AE', name: 'tgl_gejala' },
            { col: 'AF', name: 'no_spesimen' },
            { col: 'AG', name: 'no_pemeriksaan' },
            { col: 'AH', name: 'jns_spesimen' },
            { col: 'AI', name: 'tgl_pengambilan' },
            { col: 'AJ', name: 'tgl_hasil' },
            { col: 'AK', name: 'hsl_lab' },
            { col: 'AL', name: 'created_date' },
          ],
          outSheet: [
            { name: 'alamat_ktp' },
            { name: 'created_id' },
            { name: 'bantu' },
          ],
        },
      },
    ],
  },
}
