# Deploy note (P0)

Production must not serve commit `23f3ddc` CartSidebar (fake Vipps).

After merge of `hotfix/kill-fake-vipps-success`, confirm live bundle no longer contains:
- `vipps-pending`
- `Takk for handelen`
- `setTimeout(() => setStep('success')`

Expected interim UX: mailto-stub with explicit «Betaling er IKKE gjennomført».
