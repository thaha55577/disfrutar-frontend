export const uploadCertificateToS3 = async (pdfFile, presignedUrl) => {
    try {
        const response = await fetch(presignedUrl, {
            method: 'PUT',
            body: pdfFile,
            headers: {
                'Content-Type': 'application/pdf'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`S3 Upload failed: ${response.status} - ${errorText}`);
        }

        return true;
    } catch (error) {
        console.error('Error during S3 upload:', error);
        throw error;
    }
};
