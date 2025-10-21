
import { html, Html } from '@elysiajs/html'

export function index(tokens, metadata) {
  return <html lang="en" >
    <head>
      <title>tokens</title>
    </head>
    <body>
      <div>Total Solana Balance: {metadata.solana_balance.toLocaleString()}</div>
      <div>Total Legend Balance: {metadata.legend_balance.toLocaleString()}</div>
      <table>
        <thead>
          <th>wallet address</th>
          <th>legend</th>
          <th>solana</th>
        </thead>
        <tbody>
          {tokens.map(token => {
            return <tr>
              <td>{token.address}</td>
              <td>{token.legend.toLocaleString()}</td>
              <td>{token.solana}</td>
            </tr>
          })}
        </tbody>
      </table>
    </body>
  </html>
}