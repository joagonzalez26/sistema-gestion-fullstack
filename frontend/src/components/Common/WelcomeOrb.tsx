import "./welcome-orb.css"

const text = "Bienvenido"

export function WelcomeOrb() {
  return (
    <div className="welcome-effect-shell">
      <div className="welcome-loader-wrapper">
        {text.split("").map((char, index) => (
          <span
            key={`${char}-${index}`}
            className="welcome-loader-letter"
          >
            {char}
          </span>
        ))}
        <div className="welcome-loader" />
      </div>
    </div>
  )
}