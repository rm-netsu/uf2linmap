import { writeLinearPayloadBack } from '#write'
import {
	UF2_BLOCK_PAYLOAD_FIELD_OFFSET,
	UF2_BLOCK_SIZE,
	UF2_FLASH_ADDR_FIELD_OFFSET,
	UF2_HEADER_SIZE,
} from '#constants'


describe('write', () => {
	const createUF2Block = (address: number, data: Buffer): Buffer => {
		const block = Buffer.alloc(UF2_BLOCK_SIZE)
		block.writeUInt32LE(0x0A324655, 0) // first magic
		block.writeUInt32LE(0x9E5A5157, 4) // second magic
		block.writeUInt32LE(0, 8) // flags
		block.writeUInt32LE(address, UF2_FLASH_ADDR_FIELD_OFFSET)
		block.writeUInt32LE(data.length, UF2_BLOCK_PAYLOAD_FIELD_OFFSET)
		block.writeUInt32LE(0, 20) // block index
		block.writeUInt32LE(0, 24) // block count
		block.writeUInt32LE(0, 28)
		data.copy(block, UF2_HEADER_SIZE)
		return block
	}


	it('writeLinearPayloadBack should correctly write the payload back to the UF2 buffer', () => {
		const block1Data = Buffer.from([1, 2, 3])
		const block1Address = 0x2000
		const block1 = createUF2Block(block1Address, block1Data)

		const block2Data = Buffer.from([4, 5])
		const block2Address = 0x2003
		const block2 = createUF2Block(block2Address, block2Data)

		const originalUf2Buffer = Buffer.concat([block1, block2])
		const newPayload = Buffer.from([10, 20, 30, 40, 50])
		const updatedUf2Buffer = writeLinearPayloadBack(originalUf2Buffer, newPayload)

		const updatedBlock1Data = updatedUf2Buffer.subarray(
			UF2_HEADER_SIZE,
			UF2_HEADER_SIZE + block1Data.length
		)
		const updatedBlock2Data = updatedUf2Buffer.subarray(
			UF2_BLOCK_SIZE + UF2_HEADER_SIZE,
			UF2_BLOCK_SIZE + UF2_HEADER_SIZE + block2Data.length
		)

		expect(updatedBlock1Data).toEqual(Buffer.from([10, 20, 30]))
		expect(updatedBlock2Data).toEqual(Buffer.from([40, 50]))
	})

	it('writeLinearPayloadBack should throw error if payload size is smaller than original', () => {
		const block1Data = Buffer.from([1, 2, 3])
		const block1Address = 0x2000
		const block1 = createUF2Block(block1Address, block1Data)

		const block2Data = Buffer.from([4, 5])
		const block2Address = 0x2003
		const block2 = createUF2Block(block2Address, block2Data)

		const originalUf2Buffer = Buffer.concat([block1, block2])
		const newPayload = Buffer.from([10, 20])

		expect(() => writeLinearPayloadBack(originalUf2Buffer, newPayload)).toThrow(
			'Payload size mismatch. Cannot write back to UF2.'
		)
	})

	it('writeLinearPayloadBack should handle cases with a single block', () => {
		const block1Data = Buffer.from([1, 2, 3, 4, 5])
		const block1Address = 0x2000
		const block1 = createUF2Block(block1Address, block1Data)
		const originalUf2Buffer = block1
		const newPayload = Buffer.from([10, 20, 30, 40, 50])
		const updatedUf2Buffer = writeLinearPayloadBack(originalUf2Buffer, newPayload)
		const updatedBlock1Data = updatedUf2Buffer.subarray(
			UF2_HEADER_SIZE,
			UF2_HEADER_SIZE + block1Data.length
		)
		expect(updatedBlock1Data).toEqual(Buffer.from([10, 20, 30, 40, 50]))
	})
})
