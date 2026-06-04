'use client';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';

export default function TestPage() {
  const { id } = useParams();
  useEffect(() => {
    console.log('TestPage mounted, id:', id);
  }, [id]);
  return <h1>Dynamic route works! ID = {id}</h1>;
}