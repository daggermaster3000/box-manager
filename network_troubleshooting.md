# 🌐 Network Troubleshooting Guide

If you cannot access the BioLab Box Manager from your phone using the local IP address (e.g., `http://192.168.1.50:5173`), follow these steps:

## 1. Verify Network Connection
- Ensure both your Mac and your phone are connected to the **same Wi-Fi network**.
- Check if your Wi-Fi has "Client Isolation" enabled (common in guest or corporate networks), which prevents devices from seeing each other.

## 2. Check macOS Firewall
1. Go to **System Settings** > **Network** > **Firewall**.
2. If Firewall is ON:
    - Click **Options...**
    - Ensure "Block all incoming connections" is **OFF**.
    - Ensure `node` (Vite) is allowed to receive incoming connections.
3. **Tip**: Try temporarily turning the Firewall OFF to see if it resolves the issue.

## 3. Verify IP Address
- Run `ifconfig` in your terminal and look for `inet` under `en0` or `en1`.
- Ensure the QR code host in the app matches this IP exactly, including the port `:5173`.

## 4. Test Connectivity
- Open your Mac's browser and go to `http://<your-ip>:5173`.
- If it works on your Mac but not your phone, it's almost certainly a Firewall or Network Isolation issue.

## 5. Mobile Browser Tips
- Some mobile browsers block "insecure" HTTP local connections. Try using a different browser (e.g., Chrome/Safari) if one fails.
- Disable any VPN on your phone as it might route traffic away from the local network.
