'use client';
import { useParams } from 'next/navigation';

export default function TestPage() {
  const { id } = useParams();
  return <h1>Dynamic route works! ID = {id}</h1>;
}