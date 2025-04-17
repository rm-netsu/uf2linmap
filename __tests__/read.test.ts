import { detectOverlappingBlocks, readLinearPayload } from '#read'
import {
	UF2_BLOCK_PAYLOAD_FIELD_OFFSET,
	UF2_BLOCK_SIZE,
	UF2_FLASH_ADDR_FIELD_OFFSET,
	UF2_HEADER_SIZE,
} from '#constants'


describe('read', () => {
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

	it('detectOverlappingBlocks should not throw error for non-overlapping blocks', () => {
		const block1Data = Buffer.from([1, 2, 3])
		const block1Address = 0x2000
		const block1 = { data: block1Data, address: block1Address, offset: 0 }

		const block2Data = Buffer.from([4, 5])
		const block2Address = 0x2003
		const block2 = { data: block2Data, address: block2Address, offset: UF2_BLOCK_SIZE }

		expect(() => detectOverlappingBlocks([block1, block2])).not.toThrow()
	})

	it('detectOverlappingBlocks should throw error for overlapping blocks', () => {
		const block1Data = Buffer.from([1, 2, 3, 4])
		const block1Address = 0x2000
		const block1 = { data: block1Data, address: block1Address, offset: 0 }

		const block2Data = Buffer.from([5])
		const block2Address = 0x2003
		const block2 = { data: block2Data, address: block2Address, offset: UF2_BLOCK_SIZE }

		expect(() => detectOverlappingBlocks([block1, block2])).toThrow(
			'Overlapping blocks detected: Address 8192 + 4 > 8195'
		)
	})

	it('readLinearPayload should correctly read the linear payload from non-overlapping blocks', () => {
		const block1Data = Buffer.from([1, 2, 3])
		const block1Address = 0x2000
		const block1 = createUF2Block(block1Address, block1Data)

		const block2Data = Buffer.from([4, 5])
		const block2Address = 0x2003
		const block2 = createUF2Block(block2Address, block2Data)

		const uf2Buffer = Buffer.concat([block2, block1]) // Intentionally out of order
		const payload = readLinearPayload(uf2Buffer)
		expect(payload).toEqual(Buffer.from([1, 2, 3, 4, 5]))
	})

	it('readLinearPayload should throw error for overlapping blocks', () => {
		const block1Data = Buffer.from([1, 2, 3, 4])
		const block1Address = 0x2000
		const block1 = createUF2Block(block1Address, block1Data)

		const block2Data = Buffer.from([5])
		const block2Address = 0x2003
		const block2 = createUF2Block(block2Address, block2Data)

		const uf2Buffer = Buffer.concat([block1, block2])
		expect(() => readLinearPayload(uf2Buffer)).toThrow(
			'Overlapping blocks detected: Address 8192 + 4 > 8195'
		)
	})
})
