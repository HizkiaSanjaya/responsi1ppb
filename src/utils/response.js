export function ok(res, data, message = 'Berhasil') {
  return res.status(200).json({ success: true, message, data })
}

export function created(res, data, message = 'Data berhasil dibuat') {
  return res.status(201).json({ success: true, message, data })
}

export function noContent(res) {
  return res.status(204).send()
}
