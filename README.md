
# pluga-plg

Pluga developer platform toolbox

## 📦 Setup

```bash
  npm install pluga-plg
```
## 🔧 Configuration

If you are using the `storageService` (>= 0.2.0), define the following in the environment:

```env
AWS_S3_BUCKET=bucket-name
AWS_REGION=region
AWS_ACCESS_KEY_ID=access-key
AWS_SECRET_ACCESS_KEY=secret-key
```
## plg.errors

### Custom Errors:
There are specific types of errors that are handled differently within the Pluga platform. Details about the supported error types and how they can be used in your code are described below:

<details>
<summary>AuthError</summary>
Authentication error, usually requires manual action from the client. Should be used in cases where an authentication issue prevents the integration from functioning.

```javascript
  plg.errors.authError(message: String)
```
</details>

<details>
<summary>Error</summary>
Generic error type. Errors of this type put the event in a failed state. Should be used when an integration issue requires manual correction by the client.

```javascript
  plg.errors.error(message: String)
```
</details>

<details>
<summary>RateLimitError</summary>

Errors of this type allow Pluga to process the events automatically at a later time. Should be used when a resource becomes unavailable due to usage limits, for example. You must provide the necessary time (in seconds) for the resource to become available again.

```javascript
  plg.errors.rateLimitError(message: String, remaining: Integer(seconds))
```
</details>

<details>
<summary>TransientError</summary>

Temporary or transient errors that may occur due to instabilities, outages, etc., and do not require any manual action for proper functioning. Events with this type of error are automatically reprocessed by the Pluga platform.

```javascript
  plg.errors.transientError(message: String)
```
</details>

## plg.files

### plg.files.remote

The `files.remote` module provides integration with Amazon S3 for file management.

<details>
<summary>async upload</summary>

Send a local file to a S3 bucket.

```
  plg.files.remote.upload({ fileKey: String, filePath: String })
```

#### Params

| Name     | Type   | Required | Description |
|----------|--------|-------------|-----------|
| fileKey   | string | Yes          | The unique key (name) for the file in the S3 bucket |
| filePath | string | Yes        | The local path of the file to upload |

#### Return

```json
{
  "fileKey": "string"
}
```

#### Errors


| type | When it occurs | Example message |
|--------------|---------------|-------------------|
| `Error`      | Local path does not exist | - |
| `Error`      | Internal errors in the AWS SDK | - |

</details>

<details>
<summary>async download </summary>

Download a file from an Amazon S3 bucket and save it to a local path.

```
  plg.files.remote.download({ 
      fileKey: String, 
      pathToWrite: String
      sizeLimit: Number
  })
```

#### Params

| Name        | Type     | Required | Description |
|-------------|----------|-------------|-----------|
| fileKey      | string   | Yes          | The unique key (name) for the file in the S3 bucket |
| pathToWrite | string   | Yes           | Local path where the downloaded file will be saved |
| sizeLimit   | number   | No           | Optional maximum allowed file size in bytes. If exceeded, the download will fail |

#### Return

```json
{
  "success": true
}
```

#### Errors

| type | When it occurs | Example message |
|--------------|---------------|-------------------|
| `Error`      | Local path does not exist | - |
| `Error`      | Internal errors in the AWS SDK | - |
| `Error`      | File exceeds size limit specified in the `sizeLimit` param  | `File size limit exceeded. File size: ${fileSize} bytes, limit: ${sizeLimit} bytes.` |

</details>

<details>
<summary>async getSignedUrl</summary> 

Generate a temporary signed URL to download a file from S3.

```
  plg.files.remote.getSignedUrl({ 
      fileKey: String, 
      expiresIn: Number
  })
```

#### Params

| Name      | Type     | Required | Description |
|-----------|----------|-------------|-----------|
| fileKey    | string   | Yes          | The unique key (name) for the file in the S3 bucket |
| expiresIn | number   | No         | Optional expiration time in seconds. Default: 1800 (30 minutes) |

#### Return

If the file exists:

```json
{
  "fileKey": "string",
  "signedUrl": "string",
  "expiresIn": "number"
}
```

If file does not exists returns `null`

#### Errors

| type | When it occurs | Example message |
|--------------|---------------|-------------------|
| `Error`      | Internal errors in the AWS SDK | - |

</details>

<details>
<summary>async fileExists </summary>

Checks if a file exists in S3 bucket.

```
  plg.files.remote.fileExists({ 
      fileKey: String
  })
```

#### Params

| Name   | Type     | Required | Description |
|--------|----------|-------------|-----------|
| fileKey | string   | Yes          | The unique key (name) for the file in the S3 bucket |

#### Retorno

```json
true // if the file exists
false // if the file does not exist
```

#### Errors

| type | When it occurs | Example message |
|--------------|---------------|-------------------|
| `Error`      | Internal errors in the AWS SDK, except for 404, which is treated as false | - |

</details>

### plg.files.local

The `files.local` module enables local file handling.

<details>
<summary><strong>async downloadStream</strong></summary>

Download a file from a URL as a stream and save it locally.

```javascript
plg.files.local.downloadStream({
  pathToWrite: String,
  downloadRequestParams: {
    downloadUrl: String,
    headers?: Object,
  },
  callbacks?: {
    onData?: Function,
    onEnd?: Function,
  },
})
```

#### Params

| Name                              | Type     | Required | Description                                                                                       |
| --------------------------------- | -------- | -------- | ------------------------------------------------------------------------------------------------- |
| pathToWrite                       | string   | Yes      | Local path where the downloaded file will be saved.                                               |
| downloadRequestParams             | object   | Yes      | Object containing the download URL and optional HTTP headers.                                     |
| downloadRequestParams.downloadUrl | string   | Yes      | Public URL used to download the file.                                                             |
| downloadRequestParams.headers     | object   | No       | Optional HTTP headers to be sent with the download request.                                       |
| callbacks                         | object   | No       | Optional callbacks executed during the download lifecycle.                                        |
| callbacks.onData                  | function | No       | Executed for each received data chunk. Receives `(dataChunk, currentDownloadedBytesCount)`.       |
| callbacks.onEnd                   | function | No       | Executed when the download finishes. If it returns a value, the promise resolves with that value. |


#### Return by default
```json
{
  "success": true
}
```

- Note: If `onEndCallback` returns a value, the promise resolves with that value instead

#### Errors


| Type                  | When it occurs                                                      | Example                                                        |
| --------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------- |
| `Error`               | Local path to write does not exist or is not writable               | —                                                              |
| `Error`               | Download URL provided is not public or request fails                | —                                                              |
| `onDataCallback`      | Error thrown inside `callbacks.onData`                              | `{ "type": "onDataCallback", "error": <original error> }`      |
| `onEndCallback`       | Error thrown inside `callbacks.onEnd`                               | `{ "type": "onEndCallback", "error": <original error> }`       |
| `StreamPipelineError` | Stream pipeline fails (connection drop, timeout, write error, etc.) | `{ "type": "StreamPipelineError", "error": <original error> }` |


</details>
