declare module 'pdfjs-dist/build/pdf' {
  export const GlobalWorkerOptions: {
    workerSrc: string;
  };
  export const version: string;
}

declare module 'pdfjs-dist/build/pdf.worker.entry' {
  const content: string;
  export default content;
} 