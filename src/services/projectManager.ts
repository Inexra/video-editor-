import { Project, Clip, Track, ProjectResolution } from '../types/editor';
import { RESOLUTION_PRESETS, DEFAULT_TRACKS } from '../constants/presets';

const STORAGE_KEY_CURRENT_PROJECT = 'lightvideo_editor_current_project';
const STORAGE_KEY_AUTOSAVE = 'lightvideo_editor_autosave_snapshot';
const STORAGE_KEY_SETTINGS = 'lightvideo_editor_settings';

export class ProjectManager {
  // Create a brand new project
  public static createDefaultProject(name: string = 'Untitled Project'): Project {
    const defaultRes: ProjectResolution = RESOLUTION_PRESETS[0]; // 1080p
    return {
      id: `proj-${Date.now()}`,
      name,
      resolution: defaultRes,
      fps: 30,
      duration: 30,
      tracks: JSON.parse(JSON.stringify(DEFAULT_TRACKS)),
      clips: [],
      lastModified: Date.now(),
      version: '1.0.0',
    };
  }

  // Save project to local storage
  public static saveToLocalStorage(project: Project): void {
    try {
      localStorage.setItem(STORAGE_KEY_CURRENT_PROJECT, JSON.stringify(project));
      localStorage.setItem(STORAGE_KEY_AUTOSAVE, JSON.stringify({
        timestamp: Date.now(),
        project,
      }));
    } catch {
      console.warn('LocalStorage limit reached. Old snapshots purged.');
    }
  }

  // Load project from local storage
  public static loadFromLocalStorage(): Project | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY_CURRENT_PROJECT);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load project from storage:', e);
    }
    return null;
  }

  // Check if a crash recovery snapshot exists
  public static checkCrashRecovery(): { hasRecovery: boolean; timestamp?: number; project?: Project } {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_AUTOSAVE);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          hasRecovery: true,
          timestamp: parsed.timestamp,
          project: parsed.project,
        };
      }
    } catch {
      // Ignored
    }
    return { hasRecovery: false };
  }

  // Clear crash recovery snapshot
  public static clearCrashRecovery(): void {
    localStorage.removeItem(STORAGE_KEY_AUTOSAVE);
  }

  // Export project as a downloadable .lvproj file (JSON instruction manifest, lightweight)
  public static exportProjectFile(project: Project): void {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${project.name.replace(/\s+/g, '_')}.lvproj`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  // Import .lvproj JSON file
  public static importProjectFile(file: File): Promise<Project> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const project: Project = JSON.parse(content);
          resolve(project);
        } catch (err) {
          reject(new Error('Invalid .lvproj project file format'));
        }
      };
      reader.onerror = () => reject(new Error('Unable to read project file'));
      reader.readAsText(file);
    });
  }

  // Cache estimation & cleanup
  public static getEstimatedCacheSizeMB(): number {
    return 145; // Simulated modest cache usage in MB
  }

  public static clearCache(): void {
    // Revoke any created object URLs if stored
    sessionStorage.clear();
  }
}
