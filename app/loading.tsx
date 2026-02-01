export default function Loading() {
  return (
    <div className='flex items-center justify-center min-h-screen'>
      <div className='flex flex-col items-center gap-4'>
        <div className='h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent' />
        <p className='text-gray-600'>Carregando...</p>
      </div>
    </div>
  );
}
