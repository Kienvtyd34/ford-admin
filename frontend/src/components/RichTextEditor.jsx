import React from 'react';
import { Editor } from '@tinymce/tinymce-react';
import axios from 'axios';

const RichTextEditor = ({ value, onChange, editorKey }) => {
  return (
    <div className="tinymce-wrapper border rounded-lg overflow-hidden">
      <Editor
        // key quan trọng nhất để reset nội dung khi đổi xe
        key={editorKey} 
        apiKey='gv0dobysumfihba6i2rhdg3v79x9bvpa2e33l13gmng5f0qv' 
        // Dùng initialValue để Editor load nội dung cũ ngay khi mount
        initialValue={value}
        onEditorChange={(newValue) => onChange(newValue)}
        init={{
          height: 500,
          menubar: 'insert table format view',
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | blocks | bold italic forecolor | ' +
            'alignleft aligncenter alignright alignjustify | ' +
            'bullist numlist outdent indent | removeformat | image table | help',
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
          image_caption: true,
          image_title: true,
          automatic_uploads: true,
          file_picker_types: 'image',
          images_upload_handler: async (blobInfo) => {
            return new Promise(async (resolve, reject) => {
              const formData = new FormData();
              formData.append('file', blobInfo.blob(), blobInfo.filename());

              try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const token = userInfo ? userInfo.token : '';

                const response = await axios.post(
                  'https://ford-admin.onrender.com/api/vehicles/upload-editor', 
                  formData, 
                  {
                    headers: {
                      'Content-Type': 'multipart/form-data',
                      Authorization: `Bearer ${token}`
                    }
                  }
                );
                resolve(response.data.location); 
              } catch (error) {
                reject({ message: 'Lỗi tải ảnh lên: ' + error.message, remove: true });
              }
            });
          },
          table_default_attributes: { border: '1' },
          table_default_styles: { 'border-collapse': 'collapse', 'width': '100%' }
        }}
      />
    </div>
  );
};

export default RichTextEditor;