const Page = async ({params,}:{params: Promise<{videoId: string}>}) => {

  const { videoId } = await params;

  return (
    <div>
      <h1>Feed Page: Video Id is {videoId}</h1>
    </div>
  );
}

export default Page;