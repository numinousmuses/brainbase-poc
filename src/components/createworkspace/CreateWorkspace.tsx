import { useState } from 'react';

export default function CreateWorkspace() {
  const [name, setName] = useState('');
  const [files, setFiles] = useState(null);
  const [responseData, setResponseData] = useState(null);

  // In a real app, the owner_id would come from your user auth context.
  // Here, we use a hardcoded example for demonstration.
  const ownerId = '123e4567-e89b-12d3-a456-426614174000';

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('owner_id', ownerId);
    formData.append('name', name);

    if (files) {
      // Append each file to the FormData object
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }
    }

    try {
      const res = await fetch('/workspace/new', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setResponseData(data);
    } catch (err) {
      console.error('Error creating workspace:', err);
    }
  };

  return (
    <div>
      <h1>Create New Workspace</h1>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div>
          <label htmlFor="name">Workspace Name:</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="files">Upload Files:</label>
          <input
            id="files"
            type="file"
            multiple
            onChange={handleFileChange}
          />
        </div>
        <button type="submit">Create Workspace</button>
      </form>
      {responseData && (
        <div>
          <h2>Workspace Created</h2>
          <p>Workspace ID: {responseData.workspace_id}</p>
          {responseData.files.length > 0 && (
            <>
              <h3>Uploaded Files:</h3>
              <ul>
                {responseData.files.map((file, index) => (
                  <li key={index}>
                    {file.filename} (File ID: {file.file_id})
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
