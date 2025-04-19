# uf2linmap

Library for extracting and writing the payload data within UF2 firmware files, handling the **linear address space mapping** defined by the UF2 block structure.

UF2 (USB Flashing Format) files contain firmware data split into fixed-size blocks, each targeting a specific flash memory address. This library allows you to treat the contiguous data across these blocks as a single linear buffer, ordered by their intended flash addresses.

## Features

* Extract the combined payload data from a UF2 file as a single `Buffer`.
* Write a modified payload `Buffer` back into an existing UF2 buffer, replacing the original data while preserving the UF2 block structure.
* Includes basic validation for overlapping blocks.

## Installation

```bash
npm install @rm-netsu/uf2linmap
```

## Usage

### Reading the linear payload

Use the `readLinearPayload` function to extract all payload data from a UF2 buffer and combine it into a single `Buffer`, ordered by the flash addresses specified in the UF2 blocks.

```typescript
import { readFile } from 'fs/promises'; // Required for reading the file
import { readLinearPayload } from '@rm-netsu/uf2linmap';

// Path to your UF2 file
const uf2FilePath = 'path/to/your/firmware.uf2'

try {
    // Read the UF2 file into a Buffer
    const uf2Buffer = await readFile(uf2FilePath);

    // Extract the combined linear payload
    const payload: Buffer = readLinearPayload(uf2Buffer);

    console.log(`Successfully read payload of size ${payload.length} bytes.`);
    // You can now work with the 'payload' Buffer
    // ...

} catch (error) {
    console.error('Error reading UF2 payload:', error);
    // Errors might include 'Overlapping blocks detected' or file system errors
}
```

### Writing the linear payload back

Use the `writeLinearPayloadBack` function to write a new `Buffer` containing modified payload data back into an existing UF2 buffer. The function will distribute the new payload across the original UF2 blocks based on their size and order.

**Note:** The size of the payload buffer must exactly match the total size of the original payload extracted from the UF2 file.

```typescript
import { readFile, writeFile } from 'fs/promises'; // Required for file operations
import { readLinearPayload, writeLinearPayloadBack } from '@rm-netsu/uf2linmap';

// Path to your UF2 file
const uf2FilePath = 'path/to/your/firmware.uf2';

try {
    // 1. Read the original UF2 file
    const uf2Buffer = await readFile(uf2FilePath);

    // 2. (Optional) Read the current payload if you need to modify it
    const originalPayload: Buffer = readLinearPayload(uf2Buffer);

    // 3. Create or obtain your modified payload
    // Ensure the size of modifiedPayload matches originalPayload.length
    const modifiedPayload: Buffer = Buffer.alloc(originalPayload.length);
    // ... populate modifiedPayload with your data ...

    // 4. Write the modified payload back into the UF2 buffer
    // This modifies the original 'uf2Buffer' in place
    const updatedUf2Buffer: Buffer = writeLinearPayloadBack(uf2Buffer, modifiedPayload);

    // 5. (Optional) Save the modified UF2 buffer back to a file
    await writeFile(uf2FilePath, updatedUf2Buffer);

    console.log(`Successfully wrote payload back to ${uf2FilePath}.`);

} catch (error) {
    console.error('Error writing UF2 payload:', error);
    // Errors might include 'Payload size mismatch' or file system errors
}
```

## API Reference

* `readLinearPayload(uf2Buffer: Buffer): Buffer`
    * Reads the UF2 `uf2Buffer`, extracts payload data from all blocks, sorts them by address, checks for overlaps, and returns a single `Buffer` containing the combined payload.
    * Throws an `Error` if overlapping blocks are detected.
* `writeLinearPayloadBack(uf2Buffer: Buffer, payload: Buffer): Buffer`
    * Reads the block structure from `uf2Buffer`, takes `payload` (a `Buffer`), and writes the data from `payload` back into the corresponding block data areas in `uf2Buffer`.
    * Returns the modified `uf2Buffer`.
    * Throws an `Error` if the size of `payload` does not match the total original payload size of the UF2 file.

## Contributing

Feel free to open issues or submit pull requests if you find bugs or want to add features.
