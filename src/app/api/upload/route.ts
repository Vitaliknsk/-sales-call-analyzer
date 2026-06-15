import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // Для MVP мы разрешаем загрузку всем, но ограничиваем форматы и размер
        return {
          allowedContentTypes: [
            'audio/mpeg',
            'audio/mp3',
            'audio/wav',
            'audio/x-wav',
            'audio/wave',
            'audio/x-m4a',
            'audio/m4a',
            'audio/mp4',
          ],
          maximumSizeInBytes: 30 * 1024 * 1024, // 30 MB
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Можно залогировать загрузку
        console.log('blob upload completed', blob, tokenPayload);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
