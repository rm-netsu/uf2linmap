import type { BlockView } from '#interfaces'
import { getBlockViews, getPayloadSize } from '#utils'


/** @throws {Error} Overlapping blocks detected */
export const detectOverlappingBlocks = (blockViews: BlockView[]) => {
	if(blockViews.length <= 1) return;

	blockViews.slice(1).reduce((previous, current) => {
		if(previous.address + previous.data.length > current.address)
			throw new Error(
				`Overlapping blocks detected: Address ${
					previous.address
				} + ${
					previous.data.length
				} > ${
					current.address
				}`
			)

		return current
	}, blockViews[0])
}

/** @throws {Error} Overlapping blocks detected */
export const readLinearPayload = (uf2Buffer: Buffer): Buffer => {
	const blockViews = getBlockViews(uf2Buffer)

	detectOverlappingBlocks(blockViews)

	return Buffer.from(
		blockViews.reduce<[Uint8Array, number]>(
			([payload, offset], blockView) => {
				payload.set(blockView.data, offset)
				return [payload, offset + blockView.data.length]
			},
			[new Uint8Array(getPayloadSize(blockViews)), 0]
		)[0]
	)
}
