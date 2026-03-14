// Hidden canvas for QR code processing
export default function HiddenCanvas() {
  return (
    <canvas
      ref={null}
      style={{ display: 'none' }}
      width={640}
      height={480}
    />
  )
}