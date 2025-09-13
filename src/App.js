import React, { useState } from 'react';
import { Trophy, Calendar, Users, MapPin, Clock, Plus, Edit3, Trash2, UserPlus, X, Check } from 'lucide-react';

const CoincheTournamentSite = () => {
  const [tournaments, setTournaments] = useState([]);
  const [currentView, setCurrentView] = useState('home');
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [notification, setNotification] = useState(null);

  const [tournamentData, setTournamentData] = useState({
    name: '',
    date: '',
    time: '',
    location: '',
    maxTeams: 16
  });

  const [teamData, setTeamData] = useState({
    player1: '',
    player2: ''
  });

  const [tournamentTeams, setTournamentTeams] = useState({});
  const [tournamentWaitingLists, setTournamentWaitingLists] = useState({});

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreateTournament = () => {
    if (!tournamentData.name || !tournamentData.date || !tournamentData.time || !tournamentData.location) {
      showNotification('error', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    const newTournament = {
      id: Date.now(),
      ...tournamentData,
      createdAt: new Date().toLocaleDateString('fr-FR')
    };

    setTournaments([...tournaments, newTournament]);
    setTournamentTeams({ ...tournamentTeams, [newTournament.id]: [] });
    setTournamentWaitingLists({ ...tournamentWaitingLists, [newTournament.id]: [] });

    setTournamentData({ name: '', date: '', time: '', location: '', maxTeams: 16 });
    setShowCreateForm(false);
    setCurrentView('tournaments');
    showNotification('success', 'Tournoi créé avec succès');
  };

  const selectTournament = (tournament) => {
    setSelectedTournament(tournament);
    setCurrentView('tournament-detail');
  };

  const handleTeamRegistration = () => {
    if (!teamData.player1 || !teamData.player2) {
      showNotification('error', 'Veuillez renseigner les noms des deux joueurs');
      return;
    }

    const tournamentId = selectedTournament.id;
    const currentTeams = tournamentTeams[tournamentId] || [];
    const currentWaiting = tournamentWaitingLists[tournamentId] || [];

    const newTeam = {
      id: editingTeam ? editingTeam.id : Date.now(),
      player1: teamData.player1,
      player2: teamData.player2,
      registrationDate: editingTeam ? editingTeam.registrationDate : new Date().toLocaleDateString('fr-FR')
    };

    if (editingTeam) {
      const teamInMain = currentTeams.find(t => t.id === editingTeam.id);
      const teamInWaiting = currentWaiting.find(t => t.id === editingTeam.id);

      if (teamInMain) {
        setTournamentTeams({
          ...tournamentTeams,
          [tournamentId]: currentTeams.map(t => t.id === editingTeam.id ? newTeam : t)
        });
      } else if (teamInWaiting) {
        setTournamentWaitingLists({
          ...tournamentWaitingLists,
          [tournamentId]: currentWaiting.map(t => t.id === editingTeam.id ? newTeam : t)
        });
      }

      showNotification('success', 'Équipe modifiée avec succès');
    } else {
      if (currentTeams.length < selectedTournament.maxTeams) {
        setTournamentTeams({
          ...tournamentTeams,
          [tournamentId]: [...currentTeams, newTeam]
        });
        showNotification('success', 'Équipe inscrite avec succès');
      } else {
        setTournamentWaitingLists({
          ...tournamentWaitingLists,
          [tournamentId]: [...currentWaiting, newTeam]
        });
        showNotification('info', 'Tournoi complet - Équipe ajoutée à la liste d\'attente');
      }
    }

    setTeamData({ player1: '', player2: '' });
    setShowTeamForm(false);
    setEditingTeam(null);
  };

  const handleDeleteTeam = (teamId) => {
    const tournamentId = selectedTournament.id;
    const currentTeams = tournamentTeams[tournamentId] || [];
    const currentWaiting = tournamentWaitingLists[tournamentId] || [];

    const teamInMain = currentTeams.find(t => t.id === teamId);
    const teamInWaiting = currentWaiting.find(t => t.id === teamId);

    if (teamInMain) {
      const newTeams = currentTeams.filter(t => t.id !== teamId);

      if (currentWaiting.length > 0) {
        const promotedTeam = currentWaiting[0];
        const newWaiting = currentWaiting.slice(1);

        setTournamentTeams({
          ...tournamentTeams,
          [tournamentId]: [...newTeams, promotedTeam]
        });
        setTournamentWaitingLists({
          ...tournamentWaitingLists,
          [tournamentId]: newWaiting
        });

        showNotification('success', 'Équipe supprimée - Une équipe a été promue de la liste d\'attente');
      } else {
        setTournamentTeams({
          ...tournamentTeams,
          [tournamentId]: newTeams
        });
        showNotification('info', 'Équipe supprimée avec succès');
      }
    } else if (teamInWaiting) {
      setTournamentWaitingLists({
        ...tournamentWaitingLists,
        [tournamentId]: currentWaiting.filter(t => t.id !== teamId)
      });
      showNotification('info', 'Équipe retirée de la liste d\'attente');
    }
  };

  const startEditTeam = (team) => {
    setEditingTeam(team);
    setTeamData({
      player1: team.player1,
      player2: team.player2
    });
    setShowTeamForm(true);
  };

  const cancelForms = () => {
    setShowCreateForm(false);
    setShowTeamForm(false);
    setEditingTeam(null);
    setTournamentData({ name: '', date: '', time: '', location: '', maxTeams: 16 });
    setTeamData({ player1: '', player2: '' });
  };

  const getCurrentTeams = () => {
    if (!selectedTournament) return [];
    return tournamentTeams[selectedTournament.id] || [];
  };

  const getCurrentWaiting = () => {
    if (!selectedTournament) return [];
    return tournamentWaitingLists[selectedTournament.id] || [];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 max-w-md p-4 rounded-lg flex items-center gap-2 ${
          notification.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
          notification.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
          'bg-blue-100 text-blue-800 border border-blue-200'
        }`}>
          {notification.type === 'success' && <Check className="w-5 h-5" />}
          {notification.type === 'error' && <X className="w-5 h-5" />}
          <span>{notification.message}</span>
        </div>
      )}

      <header className="bg-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-800">Tournois de Coinche</h1>
            </div>
            <nav className="flex gap-4">
              <button
                onClick={() => {
                  setCurrentView('home');
                  setSelectedTournament(null);
                  cancelForms();
                }}
                className={`px-4 py-2 transition ${currentView === 'home' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'}`}
              >
                Accueil
              </button>
              <button
                onClick={() => {
                  setCurrentView('tournaments');
                  setSelectedTournament(null);
                  cancelForms();
                }}
                className={`px-4 py-2 transition ${currentView === 'tournaments' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'}`}
              >
                Tournois
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {currentView === 'home' && (
          <div className="text-center">
            <div className="max-w-2xl mx-auto mb-12">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Bienvenue sur la plateforme de tournois de coinche
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Organisez et participez aux tournois de coinche près de chez vous
              </p>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setCurrentView('tournaments')}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition flex items-center gap-2"
                >
                  <Trophy className="w-5 h-5" />
                  Voir les tournois
                </button>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Créer un tournoi
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mt-16">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Tournois organisés</h3>
                <p className="text-gray-600">
                  Créez et gérez vos tournois de coinche facilement
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Inscription simple</h3>
                <p className="text-gray-600">
                  Inscrivez votre équipe en quelques clics
                </p>
              </div>
            </div>
          </div>
        )}

        {currentView === 'tournaments' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800">Tournois disponibles</h2>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Nouveau tournoi
              </button>
            </div>

            {tournaments.length === 0 ? (
              <div className="text-center py-16">
                <Trophy className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-gray-600 mb-4">
                  Aucun tournoi pour le moment
                </h3>
                <p className="text-gray-500 mb-6">
                  Soyez le premier à créer un tournoi de coinche !
                </p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-5 h-5" />
                  Créer le premier tournoi
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tournaments.map(tournament => {
                  const teams = tournamentTeams[tournament.id] || [];
                  const waiting = tournamentWaitingLists[tournament.id] || [];

                  return (
                    <div key={tournament.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                      <h3 className="text-xl font-semibold text-gray-800 mb-3">
                        {tournament.name}
                      </h3>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(tournament.date).toLocaleDateString('fr-FR')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{tournament.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{tournament.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>{teams.length}/{tournament.maxTeams} équipes</span>
                          {waiting.length > 0 && (
                            <span className="text-orange-600 text-sm">
                              (+{waiting.length} en attente)
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{width: `${Math.min((teams.length / tournament.maxTeams) * 100, 100)}%`}}
                        ></div>
                      </div>

                      <button
                        onClick={() => selectTournament(tournament)}
                        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                      >
                        Voir le tournoi
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {currentView === 'tournament-detail' && selectedTournament && (
          <div>
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">{selectedTournament.name}</h2>
                  <div className="grid md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(selectedTournament.date).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{selectedTournament.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedTournament.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{getCurrentTeams().length}/{selectedTournament.maxTeams} équipes</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setCurrentView('tournaments')}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition"
                >
                  ← Retour
                </button>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowTeamForm(true)}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition flex items-center gap-2"
                >
                  <UserPlus className="w-5 h-5" />
                  Inscrire une équipe
                </button>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Équipes inscrites ({getCurrentTeams().length}/{selectedTournament.maxTeams})
                </h3>

                {getCurrentTeams().length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Aucune équipe inscrite pour le moment</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getCurrentTeams().map((team, index) => (
                      <div key={team.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-semibold">
                                Équipe #{index + 1}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <span className="font-medium text-gray-800">{team.player1}</span>
                              <span className="font-medium text-gray-800">{team.player2}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Inscrite le {team.registrationDate}</p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => startEditTeam(team)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Modifier l'équipe"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTeam(team.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Supprimer l'équipe"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Liste d'attente ({getCurrentWaiting().length})
                </h3>

                {getCurrentWaiting().length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Aucune équipe en attente</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getCurrentWaiting().map((team, index) => (
                      <div key={team.id} className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm font-semibold">
                                Attente #{index + 1}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <span className="font-medium text-gray-800">{team.player1}</span>
                              <span className="font-medium text-gray-800">{team.player2}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">En attente depuis le {team.registrationDate}</p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => startEditTeam(team)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Modifier l'équipe"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTeam(team.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Retirer de la liste d'attente"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Créer un nouveau tournoi</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du tournoi *
                  </label>
                  <input
                    type="text"
                    value={tournamentData.name}
                    onChange={(e) => setTournamentData({...tournamentData, name: e.target.value})}
                    placeholder="Nom du premier joueur"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Joueur 2 *
                  </label>
                  <input
                    type="text"
                    value={teamData.player2}
                    onChange={(e) => setTeamData({...teamData, player2: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nom du second joueur"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleTeamRegistration}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                  >
                    {editingTeam ? 'Modifier' : 'Inscrire'}
                  </button>
                  <button
                    onClick={cancelForms}
                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Trophy className="w-6 h-6" />
            <span className="text-lg font-semibold">Tournois de Coinche</span>
          </div>
          <p className="text-gray-400">
            La plateforme de référence pour vos tournois de coinche
          </p>
        </div>
      </footer>
    </div>
  );
};

export default CoincheTournamentSite;
                    placeholder="Ex: Tournoi de Printemps"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={tournamentData.date}
                    onChange={(e) => setTournamentData({...tournamentData, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Heure *
                  </label>
                  <input
                    type="time"
                    value={tournamentData.time}
                    onChange={(e) => setTournamentData({...tournamentData, time: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lieu *
                  </label>
                  <input
                    type="text"
                    value={tournamentData.location}
                    onChange={(e) => setTournamentData({...tournamentData, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Centre Sportif Municipal"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre d'équipes *
                  </label>
                  <select
                    value={tournamentData.maxTeams}
                    onChange={(e) => setTournamentData({...tournamentData, maxTeams: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={8}>8 équipes</option>
                    <option value={12}>12 équipes</option>
                    <option value={16}>16 équipes</option>
                    <option value={20}>20 équipes</option>
                    <option value={24}>24 équipes</option>
                    <option value={32}>32 équipes</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleCreateTournament}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
                  >
                    Créer le tournoi
                  </button>
                  <button
                    onClick={cancelForms}
                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showTeamForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                {editingTeam ? 'Modifier une équipe' : 'Inscrire une équipe'}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Joueur 1 *
                  </label>
                  <input
                    type="text"
                    value={teamData.player1}
                    onChange={(e) => setTeamData({...teamData, player1: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
