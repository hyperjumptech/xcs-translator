const UPLOAD_URL = '/api/v1/uploads'

const form = document.getElementById('upload-form')

form.addEventListener('submit', handleFormSubmit)

function handleFormSubmit(event) {
  event.preventDefault()

  disableSubmitButton()

  const formData = new FormData()

  const type = getDataType()
  const file = getFile()

  formData.append('type', type)
  if (file) formData.append('file', file)

  upload(UPLOAD_URL, formData, {
    onSuccess() {
      Swal.fire({
        toast: true,
        position: 'top',
        icon: 'success',
        title: 'Uploaded successfully',
        showConfirmButton: false,
        timer: 3000,
      })
      enableSubmitButton()
      resetProgress()
    },
    onError(error) {
      Swal.fire({
        toast: true,
        position: 'top',
        icon: 'error',
        title: error.message,
        showConfirmButton: false,
        timer: 3000,
      })
      enableSubmitButton()
      resetProgress()
    },
    onProgress: updateProgress,
  })
}

function disableSubmitButton() {
  const button = document.getElementById('submit-button')
  button.classList.add('disabled')
}

function enableSubmitButton() {
  const button = document.getElementById('submit-button')
  button.classList.remove('disabled')
}

function updateProgress(percentage) {
  const progressElement = document.getElementById('upload-progress')
  progressElement.setAttribute('aria-valuenow', Math.round(percentage))
  progressElement.style.width = `${Math.round(percentage)}%`
}

function resetProgress() {
  updateProgress(0)
}

function getDataType() {
  const select = document.getElementById('data-type')
  return select.value
}

function getFile() {
  const [file] = document.getElementById('excel-file').files
  return file
}

function upload(url, formData, { onSuccess, onError, onProgress }) {
  // using XMLHttpRequest to be able to track upload progress
  const xhr = new XMLHttpRequest()

  xhr.onload = () => {
    if (xhr.status < 300) {
      onSuccess()
    } else {
      const response = xhr.responseText
      const jsonResponse = response ? JSON.parse(xhr.responseText) : {}
      const message = jsonResponse.message || 'Something wrong happened'

      onError(new Error(message))
    }
  }
  xhr.onerror = () => onError(new Error('Something wrong happened'))
  xhr.onprogress = () => {
    const percentage = (xhr.loaded / xhr.total) * 100
    onProgress(percentage)
  }
  xhr.onabort = () => {
    console.error('Upload cancelled.')
  }

  xhr.open('POST', url)
  xhr.send(formData)
}
