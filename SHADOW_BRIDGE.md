# Shadow Frontend Bridge Configuration

To expose the Mission Control dashboard (port 3000) to the public internet using a secure tunnel.

## Option 1: Tailscale Funnel (Recommended for Tailscale users)

Tailscale Funnel allows you to expose a local port to the internet via your Tailnet.

**Command:**
```bash
tailscale funnel 3000
```

**Pre-requisites:**
1. Tailscale installed and authenticated.
2. Funnel enabled in the Tailscale Admin Console (DNS settings).
3. HTTPS enabled in the Tailscale Admin Console.

**Notes:**
- Funnel currently supports ports 443, 8443, and 10000 for public traffic.
- Running `tailscale funnel 3000` automatically sets up the proxy from HTTPS to your local port 3000.

## Option 2: Cloudflare Tunnel (cloudflared)

Cloudflare Tunnel provides a secure way to connect your resources to Cloudflare without a public IP.

**Command (Quick Tunnel):**
```bash
cloudflared tunnel --url http://localhost:3000
```

**Command (Permanent Tunnel):**
1. Create a tunnel:
   ```bash
   cloudflared tunnel create mission-control
   ```
2. Configure `config.yml`:
   ```yaml
   tunnel: <TUNNEL_ID>
   credentials-file: /path/to/credentials.json
   ingress:
     - hostname: mission-control.yourdomain.com
       service: http://localhost:3000
     - service: http_status:404
   ```
3. Run the tunnel:
   ```bash
   cloudflared tunnel run mission-control
   ```

**Pre-requisites:**
1. Cloudflare account.
2. `cloudflared` CLI installed.
