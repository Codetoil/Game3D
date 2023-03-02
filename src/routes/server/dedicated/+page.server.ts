/**
 * ALL RIGHTS RESERVED Codetoil (c) 2021-2023
 */

import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
 
export const load = (async ({ params }) => {
  throw error(404, 'Not found');
}) satisfies PageServerLoad;