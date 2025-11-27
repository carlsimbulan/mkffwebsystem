import React from 'react';
import Station1 from "../components/Station1"; 

export default function OperatorPage({ user, onLogout }) {
  // Ang component na ito ay nagsisilbing direktang data injector para sa Station1.
  // Walang external div o layout elements ang idinagdag upang maiwasan ang CSS conflicts.
  return (
    <Station1 user={user} onLogout={onLogout} />
  );
}