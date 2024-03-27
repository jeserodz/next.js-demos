'use client';

import { StorageClient, StorageObject } from '@/utils/storage';
import { useEffect, useState } from 'react';

export default function Page() {
  const [objects, setObject] = useState<StorageObject[]>([]);

  async function listObjects() {
    const data = await StorageClient.listObjects();
    setObject(data);
  }

  // fetch all objects from storage
  useEffect(() => {
    listObjects();
  }, []);

  // upload a file to storage
  async function uploadFile(event: any) {
    try {
      event.preventDefault();
      const file = event.target.file.files[0];
      const key = event.target.key.value;
      const upload = await StorageClient.putObjectPresigned(file, key);
      console.info({ upload });
      listObjects();
    } catch (error) {
      alert('Failed to upload file');
      console.error(error);
    }
  }

  return (
    <div className="m-10">
      <div className="max-w-screen-lg mx-auto">
        <div>
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-base font-semibold leading-6 text-gray-900">
                Storage
              </h1>
              <p className="mt-2 text-sm text-gray-700">
                A list of all the files stored.
              </p>
            </div>
          </div>
          <form
            className="grid grid-cols-3 mt-4 gap-4"
            onSubmit={(e) => uploadFile(e)}
          >
            <div className="flex flex-col">
              <label htmlFor="file">Select a file</label>
              <input type="file" name="file" accept="image/*" required />
            </div>
            <div className="flex flex-col">
              <label htmlFor="file">Enter the file key (path in storage)</label>
              <input
                type="text"
                name="key"
                className="block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="e.g. images/example.jpg"
                required
              />
            </div>
            <div className="flex items-end justify-end">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Upload
              </button>
            </div>
          </form>
          <div className="mt-8 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                      >
                        Object Key
                      </th>

                      <th
                        scope="col"
                        className="relative py-3.5 pl-3 pr-4 sm:pr-0"
                      >
                        <span className="sr-only">Edit</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {objects.map((object) => (
                      <tr key={object.key}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                          {object.key}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                          <div className="grid grid-flow-col gap-2">
                            <a
                              href={object.viewUrl}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              View
                              <span className="sr-only">, {object.key}</span>
                            </a>
                            <a
                              href={object.downloadUrl}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Download
                              <span className="sr-only">, {object.key}</span>
                            </a>
                            <a
                              href="#"
                              onClick={async (e) => {
                                e.preventDefault();
                                await StorageClient.deleteObject(object.key);
                                listObjects();
                              }}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Delete
                              <span className="sr-only">, {object.key}</span>
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
