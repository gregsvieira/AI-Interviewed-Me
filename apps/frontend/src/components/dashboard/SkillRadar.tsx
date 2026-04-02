import { SkillLevel } from '@/types/interview'

interface SkillRadarProps {
  skills: SkillLevel[]
}

export function SkillRadar({ skills }: SkillRadarProps) {
  if (skills.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <h3 className="text-sm font-medium text-zinc-100 mb-4">Skill Levels</h3>
        <p className="text-zinc-400 text-sm text-center py-4">No skills to display</p>
      </div>
    )
  }

  const maxSkills = Math.min(skills.length, 6)
  const displaySkills = skills.slice(0, maxSkills)

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <h3 className="text-sm font-medium text-zinc-100 mb-4">Skill Levels</h3>
      <div className="space-y-3">
        {displaySkills.map((skill) => (
          <div key={skill.topicId} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-300">{skill.name}</span>
              <span className="text-zinc-500">{skill.level}%</span>
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${skill.level}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      {skills.length > 6 && (
        <p className="text-xs text-zinc-500 mt-3 text-center">
          +{skills.length - 6} more skills
        </p>
      )}
    </div>
  )
}
