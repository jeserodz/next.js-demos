import * as S3 from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextRequest, NextResponse } from 'next/server';

export interface StorageObject {
  /** The key of the object in the storage bucket */
  key: string;
  /**
   * URL to the object in the storage bucket
   * This is the direct URL to the object in the bucket
   **/
  objectUrl: string;
  /**
   * URL to view the object in the browser
   * This is a custom route that will fetch the object and return it as a response
   * Useful for decoupling the bucket URL (e.g. for CDN, custom domain, etc.)
   **/
  viewUrl: string;
  /**
   * URL to download the object
   * This is a custom route that will fetch the object and return it as a response
   * Useful for decoupling the bucket URL (e.g. for CDN, custom domain, etc.)
   **/
  downloadUrl: string;
}

export enum STORAGE_ACTIONS {
  listObjects = 'listObjects',
  getObject = 'getObject',
  putObject = 'putObject',
  deleteObject = 'deleteObject',
  generatePresignedUrl = 'generatePresignedUrl',
  viewObject = 'view',
  downloadObject = 'download',
}

export enum STORAGE_ROUTES {
  listObjects = '/api/storage/listObjects',
  putObject = '/api/storage/putObject',
  deleteObject = '/api/storage/deleteObject',
  generatePresignedUrl = '/api/storage/generatePresignedUrl',
  viewObject = '/api/storage/view',
  downloadObject = '/api/storage/download',
}

export const StorageService = {
  s3Client: new S3.S3Client({
    endpoint: String(process.env.S3_ENDPOINT),
    region: String(process.env.S3_REGION),
    credentials: {
      accessKeyId: String(process.env.S3_ACCESS_KEY_ID),
      secretAccessKey: String(process.env.S3_SECRET_ACCESS_KEY),
    },
  }),

  getObjectUrl(key: string) {
    return new URL(key, String(process.env.S3_BUCKET_PUBLIC_URL)).toString();
  },

  getViewUrl(key: string) {
    return `${STORAGE_ROUTES.viewObject}/${key}`;
  },

  getDownloadUrl(key: string) {
    return `${STORAGE_ROUTES.downloadObject}/${key}`;
  },

  async listObjects() {
    const command = new S3.ListObjectsV2Command({
      Bucket: String(process.env.S3_BUCKET_NAME),
    });
    const response = await this.s3Client.send(command);
    if (!response.Contents) return [];
    return response.Contents.map((object) => {
      if (!object?.Key) return null;
      return {
        key: object.Key,
        viewUrl: this.getViewUrl(object.Key),
        downloadUrl: this.getDownloadUrl(object.Key),
        objectUrl: this.getObjectUrl(object.Key),
      };
    });
  },

  async putObject(file: File, key: string) {
    const command = new S3.PutObjectCommand({
      Bucket: String(process.env.S3_BUCKET_NAME),
      Key: key,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type,
      ACL: 'public-read',
    });
    await this.s3Client.send(command);
    return {
      key,
      viewUrl: this.getViewUrl(key),
      downloadUrl: this.getDownloadUrl(key),
      objectUrl: this.getObjectUrl(key),
    };
  },

  async deleteObject(key: string) {
    const command = new S3.DeleteObjectCommand({
      Bucket: String(process.env.S3_BUCKET_NAME),
      Key: key,
    });
    const response = await this.s3Client.send(command);
    return response;
  },

  async generatePresignedUrl(args: {
    key: string;
    action: STORAGE_ACTIONS;
    expiresIn?: number;
    commandOptions?: Record<string, any>;
  }) {
    let command: S3.$Command<any, any, any>;
    switch (args.action) {
      default: {
        command = new S3.GetObjectCommand({
          Bucket: String(process.env.S3_BUCKET_NAME),
          Key: args.key,
          ...args.commandOptions,
        });
        break;
      }
      case STORAGE_ACTIONS.putObject: {
        command = new S3.PutObjectCommand({
          Bucket: String(process.env.S3_BUCKET_NAME),
          Key: args.key,
          ACL: 'public-read',
          ...args.commandOptions,
        });
        break;
      }
      case STORAGE_ACTIONS.deleteObject: {
        command = new S3.DeleteObjectCommand({
          Bucket: String(process.env.S3_BUCKET_NAME),
          Key: args.key,
          ...args.commandOptions,
        });
        break;
      }
    }

    const signedUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: args.expiresIn ?? 60 * 60 * 24, // 24 hours
    });

    return {
      key: args.key,
      viewUrl: this.getViewUrl(args.key),
      downloadUrl: this.getDownloadUrl(args.key),
      objectUrl: this.getObjectUrl(args.key),
      signedUrl,
    };
  },
};

export const StorageClient = {
  async listObjects() {
    const response = await fetch(STORAGE_ROUTES.listObjects);
    return (await response.json()) as StorageObject[];
  },

  async putObject(file: File, key: string) {
    const formData = new FormData();
    formData.append('key', key);
    formData.append('file', file);
    const response = await fetch(STORAGE_ROUTES.putObject, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload file');
    }

    return (await response.json()) as StorageObject;
  },

  async putObjectPresigned(file: File, key: string) {
    const presignedResponse = await fetch(STORAGE_ROUTES.generatePresignedUrl, {
      method: 'POST',
      body: JSON.stringify({
        key,
        action: 'putObject',
      }),
    });

    if (!presignedResponse.ok) {
      throw new Error('Failed to generate presigned URL');
    }

    const presignedData = await presignedResponse.json();

    const response = await fetch(presignedData.signedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error('Failed to upload file');
    }

    return {
      key,
      viewUrl: presignedData.viewUrl,
      downloadUrl: presignedData.downloadUrl,
      objectUrl: presignedData.objectUrl,
    } as StorageObject;
  },

  async deleteObject(key: string) {
    const response = await fetch(STORAGE_ROUTES.deleteObject, {
      method: 'POST',
      body: JSON.stringify({ key }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete file');
    }

    return await response.json();
  },

  async downloadObject(key: string) {
    window.open(`${STORAGE_ROUTES.downloadObject}/${key}`);
  },
};

/*******************************
 * API routes
 ********************************/

export async function POST(
  req: NextRequest,
  context: { params: { storage: string[] } }
) {
  const command = context.params.storage[1];
  switch (command) {
    case STORAGE_ACTIONS.putObject: {
      const data = await req.formData();
      const key = data.get('key') as string;
      const file = data.get('file') as File;
      if (!key || !file)
        return Response.json({ message: 'Invalid request' }, { status: 422 });
      // TODO: check user permissions
      const response = await StorageService.putObject(file, key);
      return Response.json(response);
    }

    case STORAGE_ACTIONS.deleteObject: {
      const data = await req.json();
      // TODO: check user permissions
      const response = await StorageService.deleteObject(data.key);
      return Response.json(response);
    }

    case STORAGE_ACTIONS.generatePresignedUrl: {
      const data = await req.json();
      // TODO: check user permissions
      const response = await StorageService.generatePresignedUrl({
        key: data.key,
        action: data.action,
        expiresIn: data.expiresIn,
      });
      return Response.json(response);
    }

    default: {
      return Response.json({ message: 'Invalid command' }, { status: 422 });
    }
  }
}

export async function GET(
  req: NextRequest,
  context: { params: { storage: string[] } }
) {
  const command = context.params.storage[1];
  const key = context.params.storage.slice(2).join('/');
  switch (command) {
    case STORAGE_ACTIONS.listObjects: {
      // TODO: check user permissions
      return Response.json(await StorageService.listObjects());
    }
    case STORAGE_ACTIONS.viewObject: {
      // TODO: check user permissions
      return NextResponse.redirect(StorageService.getObjectUrl(key));
    }
    case STORAGE_ACTIONS.downloadObject: {
      // TODO: check user permissions
      const presignedData = await StorageService.generatePresignedUrl({
        key,
        action: STORAGE_ACTIONS.getObject,
        commandOptions: {
          ResponseContentDisposition: `attachment; filename="${key}"`,
        },
      });

      return NextResponse.redirect(presignedData.signedUrl);
    }
    default: {
      return Response.json({ message: 'Invalid command' }, { status: 422 });
    }
  }
}
