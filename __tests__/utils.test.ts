import { getBlockView, getBlockViews, getPayloadSize } from '#utils'
import {
	UF2_BLOCK_PAYLOAD_FIELD_OFFSET,
	UF2_BLOCK_SIZE,
	UF2_FLASH_ADDR_FIELD_OFFSET,
	UF2_HEADER_SIZE,
} from '#constants'


describe('utils', () => {
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

	const block1Data = Buffer.from([1, 2, 3])
	const block1Address = 0x2000
	const block1 = createUF2Block(block1Address, block1Data)

	const block2Data = Buffer.from([4, 5])
	const block2Address = 0x2003
	const block2 = createUF2Block(block2Address, block2Data)

	const uf2Buffer = Buffer.concat([block1, block2])

	it('getBlockView should correctly extract block information', () => {
		const blockView = getBlockView(uf2Buffer, 0)
		expect(blockView.address).toBe(block1Address)
		expect(blockView.data).toEqual(block1Data)
		expect(blockView.offset).toBe(0)

		const blockView2 = getBlockView(uf2Buffer, UF2_BLOCK_SIZE)
		expect(blockView2.address).toBe(block2Address)
		expect(blockView2.data).toEqual(block2Data)
		expect(blockView2.offset).toBe(UF2_BLOCK_SIZE)
	})

	it('getBlockViews should correctly extract and sort block views', () => {
		const blockViews = getBlockViews(uf2Buffer)
		expect(blockViews.length).toBe(2)
		expect(blockViews[0].address).toBe(block1Address)
		expect(blockViews[1].address).toBe(block2Address)
	})

	it(
		'getPayloadSize should correctly calculate the total payload size',
		() => {
			const blockViews = getBlockViews(uf2Buffer)
			expect(getPayloadSize(blockViews))
				.toBe(block1Data.length + block2Data.length)
		}
	)
})
