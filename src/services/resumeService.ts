import React from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db, Resume } from '../lib/firebase';

export interface ResumeInput {
  name: string;
  content: any;
  skills: string[];
  file_url?: string;
}

export const resumeService = {
  async createResume(userId: string, resumeData: ResumeInput): Promise<{ resume: Resume | null; error: string | null }> {
    try {
      const resumeDoc = {
        user_id: userId,
        ...resumeData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'resumes'), resumeDoc);
      
      const resume: Resume = {
        id: docRef.id,
        ...resumeDoc,
      };

      return { resume, error: null };
    } catch (error: any) {
      return { resume: null, error: 'Failed to create resume' };
    }
  },

  async getUserResumes(userId: string): Promise<{ resumes: Resume[]; error: string | null }> {
    try {
      const q = query(
        collection(db, 'resumes'),
        where('user_id', '==', userId),
        orderBy('created_at', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const resumes: Resume[] = [];
      
      querySnapshot.forEach((doc) => {
        resumes.push({
          id: doc.id,
          ...doc.data(),
        } as Resume);
      });

      return { resumes, error: null };
    } catch (error: any) {
      return { resumes: [], error: 'Failed to fetch resumes' };
    }
  },

  async updateResume(resumeId: string, updates: Partial<ResumeInput>): Promise<{ resume: Resume | null; error: string | null }> {
    try {
      const resumeRef = doc(db, 'resumes', resumeId);
      
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      };
      
      await updateDoc(resumeRef, updateData);
      
      // Note: In a real app, you'd fetch the updated document
      // For now, we'll return a partial resume object
      const resume: Resume = {
        id: resumeId,
        ...updateData,
      } as Resume;

      return { resume, error: null };
    } catch (error: any) {
      return { resume: null, error: 'Failed to update resume' };
    }
  },

  async deleteResume(resumeId: string): Promise<{ error: string | null }> {
    try {
      await deleteDoc(doc(db, 'resumes', resumeId));
      return { error: null };
    } catch (error: any) {
      return { error: 'Failed to delete resume' };
    }
  },
};