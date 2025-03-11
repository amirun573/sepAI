export interface BlobVercelInterface {
  url: string;
  metadata: {
    url: string;
    downloadUrl: string;
    pathname: string;
    contentType: string;
    contentDisposition: string;
  };
}

export interface SaveBlob {
  url: string;
  metadata: string;
  path: string;
}
