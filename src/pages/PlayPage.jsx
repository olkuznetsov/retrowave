import { useParams, useNavigate } from 'react-router-dom';
import { getConsole, getGame } from '../data/consoles';
import EmulatorPlayer from '../components/EmulatorPlayer/EmulatorPlayer';

export default function PlayPage() {
  const { consoleId, gameId } = useParams();
  const navigate = useNavigate();

  const consoleData = getConsole(consoleId);
  const game = getGame(consoleId, gameId);

  if (!consoleData || !game) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        gap: '16px',
      }}>
        <h2>Game not found</h2>
        <button
          className="btn-ffx"
          onClick={() => navigate('/')}
        >
          Back to Consoles
        </button>
      </div>
    );
  }

  return (
    <EmulatorPlayer
      game={game}
      consoleData={consoleData}
      onExit={() => navigate(`/console/${consoleId}`)}
    />
  );
}
