export function ErrorNotDeployed({ chainName = "this network" }: { chainName?: string }) {
  return (
    <div
      style={{
        background: "rgba(239, 68, 68, 0.1)",
        border: "1px solid var(--color-error)",
        color: "var(--color-error)",
        padding: "var(--spacing-lg)",
        borderRadius: "var(--radius)",
        textAlign: "center",
      }}
    >
      Contract is not deployed on {chainName}. Please deploy and update address.
    </div>
  );
}


