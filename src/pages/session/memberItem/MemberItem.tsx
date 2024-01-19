import { Member } from '../../../data/member';
import styles from './MemberItem.module.css';

interface MemberItemProps {
    member: Member;
    isSelected: boolean;
    onClick: (member: Member) => void;
}

export default function MemberItem({ member, isSelected, onClick }: MemberItemProps) {
    return (
        <div className={styles.Member + ' ' + (isSelected ? styles.Selected : '')} onClick={() => onClick(member)}>
            <div className={styles.MemberRow}>
                <span>{member.name}</span>
                <span>{member.elo}</span>
            </div>
            <span className={styles.GamesToday}>0 played / 0 upcoming</span>
        </div>
    );
}