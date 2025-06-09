import { FormSection } from "../sections/form-section";

interface VideoViewProps {
  videoId: string;
}

export const VideoView = ({ videoId }: VideoViewProps) => {
  return (
    // max-w-screen-lg
    <div className="px-4 pt-2.5">
      <FormSection videoId={ videoId } />
    </div>
  )
}