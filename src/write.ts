import { UF2_HEADER_SIZE } from '#constants'
import { getBlockViews, getPayloadSize } from '#utils'


export const writeLinearPayloadBack = (
	uf2Buffer: Buffer,
	payload: Buffer
): Buffer => {
	const blockViews = getBlockViews(uf2Buffer)

	if(getPayloadSize(blockViews) > payload.length)
		throw new Error(`Payload size mismatch. Cannot write back to UF2.`)

	blockViews.reduce<[Buffer, number]>(([uf2Buffer, payloadOffset], blockView) => {
		const newData = payload.subarray(
			payloadOffset,
			payloadOffset + blockView.data.length
		)

		uf2Buffer.set(newData, blockView.offset + UF2_HEADER_SIZE)

		return [uf2Buffer, payloadOffset + blockView.data.length]
	}, [uf2Buffer, 0])

	return uf2Buffer
}
