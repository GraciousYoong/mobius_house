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
          The 3D model on this site is an abstract placeholder and does not represent the real
          building. Photographs and drawings are reproduced from UNStudio and ArchDaily; copyright
          remains with their owners.
        </p>
      </div>
    </footer>
  );
}
