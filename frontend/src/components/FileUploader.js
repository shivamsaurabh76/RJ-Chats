import React, { useState } from 'react';
import { Button, Input, Progress, Box } from '@chakra-ui/react';
import axios from 'axios';

const FileUploader = ({ onFileUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first!');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        },
      });

      onFileUpload(response.data.fileUrl);
      setSelectedFile(null);
      setProgress(0);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('File upload failed. Please try again.');
    }
  };

  return (
    <Box>
      <Input type="file" onChange={handleFileSelect} mb={2} />
      <Button onClick={handleUpload} colorScheme="blue" mb={2}>
        Upload
      </Button>
      {progress > 0 && <Progress value={progress} max={100} />}
    </Box>
  );
};

export default FileUploader;