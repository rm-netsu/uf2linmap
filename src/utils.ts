import type { BlockView } from '#interfaces'
import {
	UF2_BLOCK_PAYLOAD_FIELD_OFFSET,
	UF2_BLOCK_SIZE,
	UF2_FLASH_ADDR_FIELD_OFFSET,
	UF2_HEADER_SIZE,
} from '#constants'


export const getBlockView = (uf2Buffer: Buffer, offset: number): BlockView => {
	const dataSize = uf2Buffer.readUInt32LE(
		offset + UF2_BLOCK_PAYLOAD_FIELD_OFFSET
	)
	const dataAddress = uf2Buffer.readUInt32LE(
		offset + UF2_FLASH_ADDR_FIELD_OFFSET
	)
	const data: Buffer = uf2Buffer.subarray(
		offset + UF2_HEADER_SIZE,
		offset + UF2_HEADER_SIZE + dataSize
	)
	
	return { data, address: dataAddress, offset }
}

export const getBlockViews = (uf2Buffer: Buffer) => Array.from(
	{ length: Math.ceil(uf2Buffer.length / UF2_BLOCK_SIZE) },
	(_, i) => getBlockView(uf2Buffer, i * UF2_BLOCK_SIZE)
).sort(
	(a, b) => a.address - b.address
)

export const getPayloadSize = (blockViews: BlockView[]) => blockViews.reduce(
	(payloadSize, block) => payloadSize + block.data.length,
	0
)
