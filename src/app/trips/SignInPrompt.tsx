export default function SignInPrompt() {
  return (
    <div className="card empty">
      <h2>Log in to see your trips</h2>
      <p className="sub">Saved plans live in your account, so you can open them on any device.</p>
      <div className="usermenu center">
        <a className="btn primary" href="/login?callbackUrl=%2Ftrips">Log in</a>
        <a className="btn" href="/signup?callbackUrl=%2Ftrips">Create an account</a>
      </div>
    </div>
  )
}
