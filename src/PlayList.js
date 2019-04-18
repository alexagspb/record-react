import React from 'react';


const getMediaElem = (item) => {
  const download = `${item.id}${item.ext}`
  const url = URL.createObjectURL(item.blob)

  if (item.type === 'audio') {
    return <span><audio controls src={url} /><a href={url} download={download}>Скачать {download}</a></span>
  } else {
    return <span><video controls src={url} /><a href={url} download={download}>Скачать {download}</a></span>
  }
}

export default ({ records, onClick }) => {
  return <ul>
    {records && records.map((item) => {
      return <li key={item.id}>{getMediaElem(item)} <span className='upload_btn' onClick={() => onClick(item.blob)}>Загрузить на сервер</span></li>
    })}
  </ul>
}
