export function PullRequestLinks({ prUrls }: { prUrls: Record<string, string> }) {
  const entries = Object.entries(prUrls);
  if (entries.length === 0) return <>—</>;

  return (
    <>
      {entries.map(([repo, url]) => (
        <div key={repo}>
          {repo}:{' '}
          {url.startsWith('http') ? (
            <a className="text-primary hover:underline" href={url} target="_blank" rel="noreferrer">
              {url}
            </a>
          ) : (
            url
          )}
        </div>
      ))}
    </>
  );
}
