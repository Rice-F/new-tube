import { ResponsiveModal } from '@/components/responsive-modal'
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

import { trpc } from '@/trpc/client';
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

interface ThumbnailGenerateModalProps {
  open: boolean;
  videoId: string;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  prompt: z.string().min(10),
})

export const ThumbnailGenerateModal = ({
  open,
  videoId,
  onOpenChange
}: ThumbnailGenerateModalProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: ''
    }
  })

  const generateThumbnail = trpc.videos.generateThumbnail.useMutation({
    onSuccess: () => {
      toast.success('Thumbnail generation started', { description: 'This may take a while.' })
      form.reset()
      onOpenChange(false)
    },
    onError: () => {
      toast.error('Something went wrong')
    }
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    generateThumbnail.mutate({
      id: videoId,
      prompt: values.prompt,
    })
  }

  return (
    <ResponsiveModal
      title="Upload a thumbnail"
      open={open}
      onOpenChange={onOpenChange}
    >
      {/* <UploadDropzone 
        endpoint="thumbnailUploader"
        input={{ videoId }}
        onClientUploadComplete={onUploadComplete}
      /> */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='flex flex-col gap-4'
        >
          <FormField
            control={form.control}
            name="prompt"
            render = {({ field }) => (
              <FormItem>
                <FormLabel>Prompt</FormLabel>
                <FormControl>
                  <Textarea 
                    { ...field }
                    className='resize-none'
                    cols={30}
                    rows={5}
                    placeholder='A description of wanted thumbnail'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='flex justify-end'>
            <Button disabled={generateThumbnail.isPending} type='submit'>Generate</Button>
          </div>
        </form>
      </Form>
    </ResponsiveModal>
  )
}