import 
  MuxUploader,
  {
    MuxUploaderDrop,
    MuxUploaderFileSelect,
    MuxUploaderProgress,
    MuxUploaderStatus
  } from "@mux/mux-uploader-react";

interface StudioUploaderProps {
  endpoint?: string|null; // 可选的上传端点，默认为null
  onSuccess: () => void;
}

export const StudioUploader = ({
  endpoint,
  onSuccess
}: StudioUploaderProps) => {
  return (
    <div>
      <MuxUploader endpoint={endpoint} />
    </div>
  )
}