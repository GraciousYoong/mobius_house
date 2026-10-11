import { project } from '../../content/project';

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <p>
          An independent study of the {project.name} by {project.architect}. Not affiliated with or
          endorsed by {project.architect}.
        </p>
        <p>
          The 3D model is an unofficial SketchUp reconstruction by Brice C, from 3D Warehouse, and
          has not been verified against UNStudio’s drawings. Photographs and drawings are reproduced
          from UNStudio and ArchDaily; copyright remains with their owners.
        </p>
      </div>
    </footer>
  );
}
