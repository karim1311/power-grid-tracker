'use server'

import { z } from 'zod'
import { sql } from '@vercel/postgres'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const currentYear = new Date().getFullYear()

const CreateOutageSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters.'),
    description: z.string().min(20, 'Description must be at least 20 characters.'),
    type: z.enum(['opensource', 'school']),
    technologies: z.string().min(2, 'Add at least one technology.'),
    yearCompleted: z.coerce
      .number()
      .int('Year must be a whole number.')
      .gte(2000, 'Year must be 2000 or later.')
      .lte(currentYear,  `Year cannot be greater than ${currentYear}.`)
})

export type State = {
    errors?: {
        title?: string[];
        description?: string[];
        type?: string[];
        technologies?: string[];
        yearCompleted?: string[];
    };
    message?: string | null;
}

export async function createOutage(
    _prevState: State, 
    formData: FormData
): Promise<State> {

    const validatedFields = CreateOutageSchema.safeParse({
        title: formData.get('title'),
        description: formData.get('description'),
        type: formData.get('type'),
        technologies: formData.get('technologies'),
        yearCompleted: formData.get('yearCompleted'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing or invalid fields. Failed to create outage.',
        }
    }

    const { title, description, type, technologies, yearCompleted } = validatedFields.data;

    const technologiesArray = technologies
        .split(',')
        .map((technology) => technology.trim())
        .filter(Boolean)

    const technologiesValue = `{${technologiesArray.join(',')}}`;

    try{
        await sql`
        INSERT INTO outages (title, description, type, technologies, year_completed)
        VALUES (${title}, ${description}, ${type}, ${technologiesValue}, ${yearCompleted})
        `;
    } catch (error) {
        console.error('DATABASE ERROR:', error);
        return {
            message: 'Database error: Failed to create outage.'
        }
    }
    revalidatePath('/outages');
    redirect('/outages')
}

export async function updateProject(id: number, formData: FormData) {
    const raw = {
        title: formData.get('title'),
        description: formData.get('description'),
        technologies: formData.get('technologies')
    }

    const parsed = ProjectFormSchema.safeParse(raw);
    if (!parsed.success) {
        throw new Error('Invalid project input.')
    }

    const { title, description, technologies } = parsed.data;

    await sql`
      UPDATE projects 
      SET
        title = ${title},
        description = ${description},
        technologies = ${technologies}
      WHERE id = ${id} 
    `;
    
    revalidatePath('/projects');
    redirect('/projects')
}

export async function deleteProject(id: number) {
    try {
        await sql`DELETE FROM projects where id = ${id}`;
        revalidatePath('/projects')
    } catch (error) {
        console.error('Error deleting your project:', error);
        throw new Error('Failed to delete project. Please try again later.')
    }
    revalidatePath('/projects')
    redirect('/projects')
}